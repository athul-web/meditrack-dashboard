import { TelemetryReading, TelemetryConfig, MetricConfig } from '../types/equipment';
import { Alert, AlertSeverity } from '../types/alerts';

/** Monotonically increasing counter used to give every alert a unique ID. */
let alertCounter = 0;

/**
 * Generate a unique, human-readable alert ID.
 */
function nextAlertId(): string {
  alertCounter += 1;
  return `ALT-${Date.now()}-${alertCounter}`;
}

/**
 * The AlertEngine evaluates telemetry readings against configured
 * thresholds and produces *new* alerts when a condition first appears.
 *
 * It tracks "active conditions" so that duplicate alerts are never
 * created for the same ongoing issue.  A condition is automatically
 * cleared when the metric returns to its normal range.
 */
export class AlertEngine {
  private activeConditions: Set<string>;
  private configs: Map<string, TelemetryConfig>;

  constructor(configs: TelemetryConfig[]) {
    this.activeConditions = new Set();
    this.configs = new Map();

    for (const config of configs) {
      this.configs.set(config.equipmentId, config);
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Evaluate the latest set of readings and return only **new** alerts
   * (conditions not already tracked).
   *
   * @param readings        Latest telemetry readings from the simulation.
   * @param offlineDeviceIds  IDs of devices currently offline.
   * @param equipmentNames  Map of equipmentId → friendly name for alert text.
   */
  evaluate(
    readings: TelemetryReading[],
    offlineDeviceIds: string[],
    equipmentNames: Map<string, string>,
  ): Alert[] {
    const newAlerts: Alert[] = [];

    // --- Threshold alerts ------------------------------------------------
    for (const reading of readings) {
      const config = this.configs.get(reading.equipmentId);
      if (!config) continue;

      for (const metricCfg of config.metrics) {
        const value = reading.metrics[metricCfg.key];
        if (value === undefined) continue;

        const severity = this.evaluateMetricSeverity(value, metricCfg);

        const conditionKey = `${reading.equipmentId}:${metricCfg.key}:${severity}`;

        if (severity === null) {
          // Metric is within normal range — clear any previously tracked
          // conditions for this metric (all severities).
          this.clearConditionsForMetric(reading.equipmentId, metricCfg.key);
          continue;
        }

        if (this.activeConditions.has(conditionKey)) {
          // Already tracking this exact condition — no duplicate alert.
          continue;
        }

        // New condition — track it and create an alert.
        this.activeConditions.add(conditionKey);

        const equipName = equipmentNames.get(reading.equipmentId) ?? reading.equipmentId;
        const direction = this.getDirection(value, metricCfg, severity);
        const threshold = this.getThresholdValue(metricCfg, severity, direction);

        newAlerts.push({
          id: nextAlertId(),
          equipmentId: reading.equipmentId,
          equipmentName: equipName,
          severity,
          status: 'active',
          category: 'threshold',
          title: `${direction === 'high' ? 'High' : 'Low'} ${metricCfg.label} — ${equipName}`,
          description:
            `${metricCfg.label} reading of ${value}${metricCfg.unit} ` +
            `exceeds ${severity} threshold of ${threshold}${metricCfg.unit}.`,
          timestamp: reading.timestamp,
        });
      }
    }

    // --- Connectivity alerts ---------------------------------------------
    for (const deviceId of offlineDeviceIds) {
      const conditionKey = `${deviceId}:connectivity:critical`;

      if (this.activeConditions.has(conditionKey)) continue;

      this.activeConditions.add(conditionKey);

      const equipName = equipmentNames.get(deviceId) ?? deviceId;

      newAlerts.push({
        id: nextAlertId(),
        equipmentId: deviceId,
        equipmentName: equipName,
        severity: 'critical',
        status: 'active',
        category: 'connectivity',
        title: `Device Offline — ${equipName}`,
        description: `${equipName} has lost connectivity and is no longer reporting telemetry.`,
        timestamp: new Date().toISOString(),
      });
    }

    // Clear connectivity conditions for devices that are back online
    const offlineSet = new Set(offlineDeviceIds);
    for (const key of Array.from(this.activeConditions)) {
      if (key.endsWith(':connectivity:critical')) {
        const deviceId = key.split(':')[0];
        if (!offlineSet.has(deviceId)) {
          this.activeConditions.delete(key);
        }
      }
    }

    return newAlerts;
  }

  /**
   * Clear all tracked conditions and reset the engine.
   */
  reset(): void {
    this.activeConditions.clear();
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  /**
   * Determine the severity for a single metric value, or `null` if the
   * value is within normal range.
   */
  private evaluateMetricSeverity(
    value: number,
    cfg: MetricConfig,
  ): AlertSeverity | null {
    // Check critical first (more severe)
    if (cfg.criticalHigh !== undefined && value >= cfg.criticalHigh) return 'critical';
    if (cfg.criticalLow !== undefined && value <= cfg.criticalLow) return 'critical';

    // Then warning
    if (cfg.warningHigh !== undefined && value >= cfg.warningHigh) return 'warning';
    if (cfg.warningLow !== undefined && value <= cfg.warningLow) return 'warning';

    return null;
  }

  /**
   * Determine whether the breach is on the high or low side.
   */
  private getDirection(
    value: number,
    cfg: MetricConfig,
    severity: AlertSeverity,
  ): 'high' | 'low' {
    if (severity === 'critical') {
      if (cfg.criticalHigh !== undefined && value >= cfg.criticalHigh) return 'high';
      return 'low';
    }
    if (cfg.warningHigh !== undefined && value >= cfg.warningHigh) return 'high';
    return 'low';
  }

  /**
   * Return the threshold value that was breached for use in the alert
   * description.
   */
  private getThresholdValue(
    cfg: MetricConfig,
    severity: AlertSeverity,
    direction: 'high' | 'low',
  ): number {
    if (severity === 'critical') {
      return direction === 'high'
        ? cfg.criticalHigh ?? cfg.max
        : cfg.criticalLow ?? cfg.min;
    }
    return direction === 'high'
      ? cfg.warningHigh ?? cfg.max
      : cfg.warningLow ?? cfg.min;
  }

  /**
   * Remove all active conditions for a specific equipment + metric
   * combination (across all severities).
   */
  private clearConditionsForMetric(equipmentId: string, metricKey: string): void {
    for (const key of Array.from(this.activeConditions)) {
      if (key.startsWith(`${equipmentId}:${metricKey}:`)) {
        this.activeConditions.delete(key);
      }
    }
  }
}
