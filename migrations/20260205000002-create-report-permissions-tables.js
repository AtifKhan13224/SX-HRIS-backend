/**
 * REPORT PERMISSIONS MODULE - DATABASE MIGRATION
 * 
 * Enterprise-grade report security and governance system
 * Zero-trust analytics, data leakage prevention, full auditability
 * 
 * Created: February 5, 2026
 * Purpose: Control access to reports, analytics, dashboards, and data extracts
 * Compliance: GDPR, SOX, ISO, Local Labor Laws
 */

module.exports = {
  async up(db) {
    const session = db.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        
        // ==========================================
        // 1. REPORT REGISTRY
        // ==========================================
        await db.createCollection('report_registry', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['reportCode', 'reportName', 'reportType', 'moduleSource', 'sensitivityLevel', 'tenantId'],
              properties: {
                reportCode: { bsonType: 'string', description: 'Unique report identifier' },
                reportName: { bsonType: 'string', description: 'Display name' },
                reportType: { 
                  enum: ['STANDARD', 'CUSTOM', 'REGULATORY', 'AD_HOC'],
                  description: 'Report classification'
                },
                moduleSource: {
                  enum: ['CORE_HR', 'PAYROLL', 'LEAVE', 'RECRUITMENT', 'PERFORMANCE', 'FINANCE', 'COMPLIANCE', 'EXECUTIVE'],
                  description: 'Source module'
                },
                sensitivityLevel: {
                  enum: ['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED'],
                  description: 'Data sensitivity classification'
                },
                description: { bsonType: 'string' },
                isActive: { bsonType: 'bool' },
                tenantId: { bsonType: 'string' },
                metadata: { bsonType: 'object' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' },
                createdBy: { bsonType: 'string' }
              }
            }
          }
        });

        await db.collection('report_registry').createIndex(
          { reportCode: 1, tenantId: 1 }, 
          { unique: true, name: 'idx_report_registry_code_tenant' }
        );
        await db.collection('report_registry').createIndex(
          { tenantId: 1, moduleSource: 1, isActive: 1 },
          { name: 'idx_report_registry_tenant_module' }
        );
        await db.collection('report_registry').createIndex(
          { sensitivityLevel: 1, tenantId: 1 },
          { name: 'idx_report_registry_sensitivity' }
        );

        // ==========================================
        // 2. REPORT CATEGORIES
        // ==========================================
        await db.createCollection('report_categories', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['categoryCode', 'categoryName', 'domain', 'tenantId'],
              properties: {
                categoryCode: { bsonType: 'string' },
                categoryName: { bsonType: 'string' },
                domain: {
                  enum: [
                    'EMPLOYEE_MASTER',
                    'COMPENSATION_PAYROLL',
                    'ATTENDANCE_LEAVE',
                    'PERFORMANCE_TALENT',
                    'COMPLIANCE_REGULATORY',
                    'EXECUTIVE_DASHBOARDS'
                  ]
                },
                description: { bsonType: 'string' },
                isActive: { bsonType: 'bool' },
                tenantId: { bsonType: 'string' },
                accessRules: { bsonType: 'object' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
              }
            }
          }
        });

        await db.collection('report_categories').createIndex(
          { categoryCode: 1, tenantId: 1 },
          { unique: true, name: 'idx_report_categories_code_tenant' }
        );

        // ==========================================
        // 3. REPORT PERMISSIONS (GRANULAR)
        // ==========================================
        await db.createCollection('report_permissions', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['reportId', 'roleId', 'tenantId'],
              properties: {
                reportId: { bsonType: 'string' },
                roleId: { bsonType: 'string' },
                canView: { bsonType: 'bool' },
                canRun: { bsonType: 'bool' },
                canExport: { bsonType: 'bool' },
                canSchedule: { bsonType: 'bool' },
                canShare: { bsonType: 'bool' },
                canApiExtract: { bsonType: 'bool' },
                exportFormats: { 
                  bsonType: 'array',
                  items: { enum: ['EXCEL', 'PDF', 'CSV', 'JSON'] }
                },
                requiresApproval: { bsonType: 'bool' },
                requiresDualApproval: { bsonType: 'bool' },
                approvalLevel: { bsonType: 'int' },
                validFrom: { bsonType: 'date' },
                validUntil: { bsonType: 'date' },
                tenantId: { bsonType: 'string' },
                metadata: { bsonType: 'object' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' },
                createdBy: { bsonType: 'string' }
              }
            }
          }
        });

        await db.collection('report_permissions').createIndex(
          { reportId: 1, roleId: 1, tenantId: 1 },
          { unique: true, name: 'idx_report_permissions_report_role_tenant' }
        );
        await db.collection('report_permissions').createIndex(
          { tenantId: 1, reportId: 1 },
          { name: 'idx_report_permissions_tenant_report' }
        );

        // ==========================================
        // 4. DATA SCOPE RULES
        // ==========================================
        await db.createCollection('report_data_scopes', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['reportId', 'roleId', 'scopeType', 'tenantId'],
              properties: {
                reportId: { bsonType: 'string' },
                roleId: { bsonType: 'string' },
                scopeType: {
                  enum: [
                    'ORG_HIERARCHY',
                    'LEGAL_ENTITY',
                    'COUNTRY',
                    'LOCATION',
                    'COST_CENTER',
                    'EMPLOYEE_GROUP',
                    'DEPARTMENT',
                    'BUSINESS_UNIT',
                    'TIME_BOUND'
                  ]
                },
                scopeValue: { bsonType: 'string' },
                scopeOperator: {
                  enum: ['EQUALS', 'IN', 'NOT_IN', 'CONTAINS', 'STARTS_WITH', 'HIERARCHICAL']
                },
                scopeCondition: { bsonType: 'object' },
                priority: { bsonType: 'int' },
                isActive: { bsonType: 'bool' },
                tenantId: { bsonType: 'string' },
                metadata: { bsonType: 'object' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
              }
            }
          }
        });

        await db.collection('report_data_scopes').createIndex(
          { reportId: 1, roleId: 1, tenantId: 1 },
          { name: 'idx_report_data_scopes_report_role' }
        );
        await db.collection('report_data_scopes').createIndex(
          { scopeType: 1, tenantId: 1 },
          { name: 'idx_report_data_scopes_type' }
        );

        // ==========================================
        // 5. COLUMN-LEVEL SECURITY
        // ==========================================
        await db.createCollection('report_column_security', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['reportId', 'columnName', 'tenantId'],
              properties: {
                reportId: { bsonType: 'string' },
                columnName: { bsonType: 'string' },
                columnDisplayName: { bsonType: 'string' },
                sensitivityLevel: {
                  enum: ['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']
                },
                isPII: { bsonType: 'bool' },
                isFinancial: { bsonType: 'bool' },
                isHealthData: { bsonType: 'bool' },
                isGovernmentId: { bsonType: 'bool' },
                visibilityRules: {
                  bsonType: 'array',
                  items: {
                    bsonType: 'object',
                    properties: {
                      roleId: { bsonType: 'string' },
                      visible: { bsonType: 'bool' },
                      masked: { bsonType: 'bool' },
                      maskingType: {
                        enum: ['FULL', 'PARTIAL', 'HASH', 'REDACTED', 'AGGREGATED_ONLY']
                      },
                      conditionalVisibility: { bsonType: 'object' }
                    }
                  }
                },
                countryRestrictions: {
                  bsonType: 'array',
                  items: { bsonType: 'string' }
                },
                requiresApproval: { bsonType: 'bool' },
                tenantId: { bsonType: 'string' },
                metadata: { bsonType: 'object' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
              }
            }
          }
        });

        await db.collection('report_column_security').createIndex(
          { reportId: 1, columnName: 1, tenantId: 1 },
          { unique: true, name: 'idx_report_column_security_report_column' }
        );
        await db.collection('report_column_security').createIndex(
          { isPII: 1, tenantId: 1 },
          { name: 'idx_report_column_security_pii' }
        );

        // ==========================================
        // 6. EXPORT CONTROLS
        // ==========================================
        await db.createCollection('report_export_controls', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['reportId', 'tenantId'],
              properties: {
                reportId: { bsonType: 'string' },
                exportAllowed: { bsonType: 'bool' },
                maxRowLimit: { bsonType: 'int' },
                allowedFormats: {
                  bsonType: 'array',
                  items: { enum: ['EXCEL', 'PDF', 'CSV', 'JSON'] }
                },
                watermarkingRequired: { bsonType: 'bool' },
                watermarkText: { bsonType: 'string' },
                passwordProtection: { bsonType: 'bool' },
                fileExpiryHours: { bsonType: 'int' },
                downloadTracking: { bsonType: 'bool' },
                preventScreenshot: { bsonType: 'bool' },
                requiresJustification: { bsonType: 'bool' },
                autoDeleteAfterDownload: { bsonType: 'bool' },
                tenantId: { bsonType: 'string' },
                metadata: { bsonType: 'object' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
              }
            }
          }
        });

        await db.collection('report_export_controls').createIndex(
          { reportId: 1, tenantId: 1 },
          { unique: true, name: 'idx_report_export_controls_report' }
        );

        // ==========================================
        // 7. ACCESS APPROVALS
        // ==========================================
        await db.createCollection('report_access_approvals', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['reportId', 'userId', 'requestDate', 'status', 'tenantId'],
              properties: {
                reportId: { bsonType: 'string' },
                userId: { bsonType: 'string' },
                requestDate: { bsonType: 'date' },
                justification: { bsonType: 'string' },
                status: {
                  enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'REVOKED']
                },
                approvers: {
                  bsonType: 'array',
                  items: {
                    bsonType: 'object',
                    properties: {
                      approverId: { bsonType: 'string' },
                      approverName: { bsonType: 'string' },
                      level: { bsonType: 'int' },
                      decision: { enum: ['PENDING', 'APPROVED', 'REJECTED'] },
                      comments: { bsonType: 'string' },
                      decisionDate: { bsonType: 'date' }
                    }
                  }
                },
                approvalType: { enum: ['SINGLE', 'DUAL', 'MULTI_LEVEL'] },
                validFrom: { bsonType: 'date' },
                validUntil: { bsonType: 'date' },
                autoExpiry: { bsonType: 'bool' },
                expiryDays: { bsonType: 'int' },
                tenantId: { bsonType: 'string' },
                metadata: { bsonType: 'object' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
              }
            }
          }
        });

        await db.collection('report_access_approvals').createIndex(
          { reportId: 1, userId: 1, tenantId: 1, status: 1 },
          { name: 'idx_report_access_approvals_report_user_status' }
        );
        await db.collection('report_access_approvals').createIndex(
          { status: 1, validUntil: 1, tenantId: 1 },
          { name: 'idx_report_access_approvals_expiry' }
        );

        // ==========================================
        // 8. AUDIT LOGS (COMPREHENSIVE)
        // ==========================================
        await db.createCollection('report_audit_logs', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['reportId', 'userId', 'action', 'timestamp', 'tenantId'],
              properties: {
                reportId: { bsonType: 'string' },
                userId: { bsonType: 'string' },
                action: {
                  enum: [
                    'VIEW', 'RUN', 'EXPORT', 'SCHEDULE', 'SHARE', 
                    'API_EXTRACT', 'MODIFY', 'DELETE', 'ACCESS_DENIED'
                  ]
                },
                timestamp: { bsonType: 'date' },
                ipAddress: { bsonType: 'string' },
                userAgent: { bsonType: 'string' },
                sessionId: { bsonType: 'string' },
                exportFormat: { bsonType: 'string' },
                rowCount: { bsonType: 'int' },
                executionTimeMs: { bsonType: 'int' },
                filters: { bsonType: 'object' },
                dataScope: { bsonType: 'object' },
                columnsAccessed: {
                  bsonType: 'array',
                  items: { bsonType: 'string' }
                },
                success: { bsonType: 'bool' },
                errorMessage: { bsonType: 'string' },
                accessSource: {
                  enum: ['WEB', 'API', 'SCHEDULED', 'MOBILE', 'INTEGRATION']
                },
                isAnomaly: { bsonType: 'bool' },
                anomalyReason: { bsonType: 'string' },
                tenantId: { bsonType: 'string' },
                metadata: { bsonType: 'object' }
              }
            }
          }
        });

        await db.collection('report_audit_logs').createIndex(
          { reportId: 1, timestamp: -1, tenantId: 1 },
          { name: 'idx_report_audit_logs_report_time' }
        );
        await db.collection('report_audit_logs').createIndex(
          { userId: 1, timestamp: -1, tenantId: 1 },
          { name: 'idx_report_audit_logs_user_time' }
        );
        await db.collection('report_audit_logs').createIndex(
          { action: 1, timestamp: -1, tenantId: 1 },
          { name: 'idx_report_audit_logs_action' }
        );
        await db.collection('report_audit_logs').createIndex(
          { isAnomaly: 1, tenantId: 1 },
          { name: 'idx_report_audit_logs_anomaly' }
        );

        // ==========================================
        // 9. SENSITIVITY FLAGS
        // ==========================================
        await db.createCollection('report_sensitivity_flags', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['reportId', 'flagType', 'tenantId'],
              properties: {
                reportId: { bsonType: 'string' },
                flagType: {
                  enum: ['PII', 'FINANCIAL', 'HEALTH', 'GOVERNMENT_ID', 'LEGAL', 'UNION']
                },
                description: { bsonType: 'string' },
                regulatoryRequirement: { bsonType: 'string' },
                complianceFramework: {
                  bsonType: 'array',
                  items: { enum: ['GDPR', 'SOX', 'ISO27001', 'HIPAA', 'LOCAL_LABOR_LAW'] }
                },
                maskingRequired: { bsonType: 'bool' },
                approvalRequired: { bsonType: 'bool' },
                retentionPeriodDays: { bsonType: 'int' },
                tenantId: { bsonType: 'string' },
                metadata: { bsonType: 'object' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
              }
            }
          }
        });

        await db.collection('report_sensitivity_flags').createIndex(
          { reportId: 1, flagType: 1, tenantId: 1 },
          { name: 'idx_report_sensitivity_flags_report_type' }
        );

        // ==========================================
        // 10. REGULATORY COMPLIANCE SNAPSHOTS
        // ==========================================
        await db.createCollection('report_compliance_snapshots', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['reportId', 'snapshotDate', 'tenantId'],
              properties: {
                reportId: { bsonType: 'string' },
                snapshotDate: { bsonType: 'date' },
                snapshotType: {
                  enum: ['STATUTORY', 'GOVERNMENT_FILING', 'AUDIT_EXTRACT', 'UNION_REPORT']
                },
                data: { bsonType: 'object' },
                dataHash: { bsonType: 'string' },
                isImmutable: { bsonType: 'bool' },
                accessedBy: {
                  bsonType: 'array',
                  items: {
                    bsonType: 'object',
                    properties: {
                      userId: { bsonType: 'string' },
                      accessDate: { bsonType: 'date' },
                      purpose: { bsonType: 'string' }
                    }
                  }
                },
                retentionUntil: { bsonType: 'date' },
                tenantId: { bsonType: 'string' },
                metadata: { bsonType: 'object' },
                createdAt: { bsonType: 'date' }
              }
            }
          }
        });

        await db.collection('report_compliance_snapshots').createIndex(
          { reportId: 1, snapshotDate: -1, tenantId: 1 },
          { name: 'idx_report_compliance_snapshots_report_date' }
        );
        await db.collection('report_compliance_snapshots').createIndex(
          { retentionUntil: 1, tenantId: 1 },
          { name: 'idx_report_compliance_snapshots_retention' }
        );

        console.log('✅ Report Permissions tables created successfully');
      });
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  },

  async down(db) {
    // Rollback - Drop all collections
    await db.collection('report_registry').drop();
    await db.collection('report_categories').drop();
    await db.collection('report_permissions').drop();
    await db.collection('report_data_scopes').drop();
    await db.collection('report_column_security').drop();
    await db.collection('report_export_controls').drop();
    await db.collection('report_access_approvals').drop();
    await db.collection('report_audit_logs').drop();
    await db.collection('report_sensitivity_flags').drop();
    await db.collection('report_compliance_snapshots').drop();
    
    console.log('✅ Report Permissions tables dropped successfully');
  }
};
