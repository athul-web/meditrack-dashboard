import { TelemetryConfig, MetricConfig, TelemetryReading } from '../types/equipment';

/**
 * Internal state tracked per metric per device.
 */
interface MetricState {
  currentValue: number;
  trend: number; // slight directional bias, updated occasionally
}

/**
 * Internal simulation state for a single device.
 */
interface DeviceSimState {
  equipmentId: string;
  metrics: Record<string, MetricState>;
  isOffline: boolean;
  offlineSince?: string;
}

/**
 * Clamp a number between min and max (inclusive).
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * SimulationEngine produces realistic telemetry readings for a set of
 * equipment devices.  Each call to `tick()` advances the simulation by
 * one step, applying a bounded random walk to every metric.
 *
 * The engine does **not** generate alerts — that responsibility belongs
 * to the AlertEngine.
 */
export class SimulationEngine {
  private states: Map<string, DeviceSimState>;
  private configs: Map<string, TelemetryConfig>;
  private tickCount: number;

  constructor(configs: TelemetryConfig[]) {
    this.states = new Map();
    this.configs = new Map();
    this.tickCount = 0;

    for (const config of configs) {
      this.configs.set(config.equipmentId, config);
      this.states.set(config.equipmentId, this.buildInitialState(config));
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Advance the simulation by one step and return the new readings for
   * every device that is currently online.
   */
  tick(): TelemetryReading[] {
    this.tickCount += 1;

    const readings: TelemetryReading[] = [];

    for (const [equipmentId, state] of this.states) {
      if (state.isOffline) {
        continue; // offline devices produce no telemetry
      }

      const config = this.configs.get(equipmentId);
      if (!config) continue;

      // Determine if an incident is triggered for this device this tick
      const incidentTriggered = Math.random() < 0.01;
      // If incident, pick one random metric to push toward warning/critical
      const incidentMetricKey = incidentTriggered
        ? config.metrics[Math.floor(Math.random() * config.metrics.length)]?.key
        : undefined;

      const metricValues: Record<string, number> = {};

      for (const metricCfg of config.metrics) {
        const ms = state.metrics[metricCfg.key];
        if (!ms) continue;

        // Every ~20 ticks, slightly adjust the trend
        if (this.tickCount % 20 === 0 || this.tickCount === 1) {
          ms.trend = (Math.random() - 0.5) * 0.6; // range -0.3 to 0.3
        }

        if (incidentTriggered && metricCfg.key === incidentMetricKey) {
          // Push the value toward a warning or critical boundary
          this.applyIncident(ms, metricCfg);
        } else {
          // Normal bounded random walk
          const noise = (Math.random() - 0.5) * metricCfg.variationRate;
          const delta = ms.trend * metricCfg.variationRate + noise;
          ms.currentValue = clamp(
            ms.currentValue + delta,
            metricCfg.min,
            metricCfg.max,
          );
        }

        // Round to 2 decimal places for cleanliness
        ms.currentValue = Math.round(ms.currentValue * 100) / 100;
        metricValues[metricCfg.key] = ms.currentValue;
      }

      readings.push({
        equipmentId,
        timestamp: new Date().toISOString(),
        metrics: metricValues,
      });
    }

    return readings;
  }

  /**
   * Force a device offline or back online.
   */
  setDeviceOffline(equipmentId: string, offline: boolean): void {
    const state = this.states.get(equipmentId);
    if (!state) return;

    state.isOffline = offline;
    state.offlineSince = offline ? new Date().toISOString() : undefined;
  }

  /**
   * Reset every device back to its baseline values and clear the tick
   * counter.
   */
  reset(): void {
    this.tickCount = 0;

    for (const [equipmentId, config] of this.configs) {
      this.states.set(equipmentId, this.buildInitialState(config));
    }
  }

  /**
   * Return the most recent metric values for every online device without
   * advancing the simulation.
   */
  getCurrentReadings(): TelemetryReading[] {
    const readings: TelemetryReading[] = [];

    for (const [equipmentId, state] of this.states) {
      if (state.isOffline) continue;

      const metricValues: Record<string, number> = {};
      for (const [key, ms] of Object.entries(state.metrics)) {
        metricValues[key] = ms.currentValue;
      }

      readings.push({
        equipmentId,
        timestamp: new Date().toISOString(),
        metrics: metricValues,
      });
    }

    return readings;
  }

  /**
   * Retrieve the internal simulation state for a single device.
   */
  getDeviceState(equipmentId: string): DeviceSimState | undefined {
    return this.states.get(equipmentId);
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  /**
   * Build the initial DeviceSimState from a TelemetryConfig, setting every
   * metric to its configured baseline.
   */
  private buildInitialState(config: TelemetryConfig): DeviceSimState {
    const metrics: Record<string, MetricState> = {};

    for (const m of config.metrics) {
      metrics[m.key] = {
        currentValue: m.baseline,
        trend: 0,
      };
    }

    return {
      equipmentId: config.equipmentId,
      metrics,
      isOffline: false,
    };
  }

  /**
   * Push a metric toward a warning or critical boundary to simulate an
   * incident.  The push is smooth — it moves the value partway toward the
   * boundary rather than snapping it there instantly.
   */
  private applyIncident(ms: MetricState, cfg: MetricConfig): void {
    // Decide whether to push high or low (pick whichever boundary exists)
    const canGoHigh = cfg.warningHigh !== undefined || cfg.criticalHigh !== undefined;
    const canGoLow = cfg.warningLow !== undefined || cfg.criticalLow !== undefined;

    let target: number;

    if (canGoHigh && canGoLow) {
      // pick a direction at random
      if (Math.random() < 0.5) {
        target = cfg.criticalHigh ?? cfg.warningHigh ?? cfg.max;
      } else {
        target = cfg.criticalLow ?? cfg.warningLow ?? cfg.min;
      }
    } else if (canGoHigh) {
      target = cfg.criticalHigh ?? cfg.warningHigh ?? cfg.max;
    } else if (canGoLow) {
      target = cfg.criticalLow ?? cfg.warningLow ?? cfg.min;
    } else {
      // No thresholds defined — just add a large nudge
      target = ms.currentValue + cfg.variationRate * 3;
    }

    // Move 30-60 % of the way toward the target for a noticeable but not
    // instant jump.
    const factor = 0.3 + Math.random() * 0.3;
    ms.currentValue = clamp(
      ms.currentValue + (target - ms.currentValue) * factor,
      cfg.min,
      cfg.max,
    );

    // Set the trend to continue drifting toward the boundary
    ms.trend = target > ms.currentValue ? 0.25 : -0.25;
  }
}
