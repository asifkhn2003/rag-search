'use client';

import { useState, useEffect } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Badge } from '@astryxdesign/core/Badge';
import { Grid } from '@astryxdesign/core/Grid';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@astryxdesign/core/Table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  MOCK_DASHBOARD_STATS,
  MOCK_DOCUMENTS,
  MOCK_MONTHLY_DATA,
  MOCK_DOC_TYPE_DIST,
  documentStatusVariant,
  documentTypeLabel,
} from '~/lib/mock-data';
import { FileText, CheckCircle, MessageSquare, HardDrive, File, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color?: string; fill?: string }[]; label?: string }) {
  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
      border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)',
      fontSize: 13,
      lineHeight: 1.5,
    }}>
      {label && <div style={{ fontWeight: 600, marginBottom: 4, color: isDark ? '#e8e8e8' : '#1a1a1a' }}>{label}</div>}
      {payload.map((entry, i) => {
        const rawColor = entry.color || entry.fill || '';
        const dotColor = rawColor.startsWith('url(') ? CHART_COLORS.accent : rawColor;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
            <span style={{ color: isDark ? '#aaa' : '#606060' }}>{entry.name}:</span>
            <span style={{ fontWeight: 600, color: isDark ? '#e8e8e8' : '#1a1a1a' }}>{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}

const recentDocs = MOCK_DOCUMENTS.slice(0, 5);

const CHART_COLORS = {
  accent: 'var(--color-accent, #0064E0)',
  success: 'var(--color-success, #0D8626)',
  warning: 'var(--color-warning, #D2A100)',
  error: 'var(--color-error, #E3193B)',
  surface: 'var(--color-surface, #ffffff)',
  border: 'var(--color-border, #e0e0e0)',
  textSecondary: 'var(--color-text-secondary, #606060)',
};

const donutColors = [CHART_COLORS.accent, CHART_COLORS.warning, CHART_COLORS.success];

const iconColors = [
  CHART_COLORS.accent,
  CHART_COLORS.success,
  CHART_COLORS.accent,
  CHART_COLORS.warning,
];

const statCards = [
  { label: 'Total Documents', value: String(MOCK_DASHBOARD_STATS.totalDocuments), icon: <FileText size={20} />, change: '+4 this week', changeType: 'success' as const },
  { label: 'Processed Documents', value: String(MOCK_DASHBOARD_STATS.processedDocuments), icon: <CheckCircle size={20} />, change: '87.5% success rate', changeType: 'success' as const },
  { label: 'Questions Asked', value: String(MOCK_DASHBOARD_STATS.aiQuestions), icon: <MessageSquare size={20} />, change: '+23 today', changeType: 'info' as const },
  { label: 'Storage Used', value: MOCK_DASHBOARD_STATS.storageUsed, icon: <HardDrive size={20} />, change: '65% of quota', changeType: 'neutral' as const },
];

function AnimatedProgressBars() {
  const [ready, setReady] = useState(0);
  const [processing, setProcessing] = useState(0);
  const [failed, setFailed] = useState(0);

  useEffect(() => {
    setReady(87.5);
    setTimeout(() => setProcessing(8.3), 150);
    setTimeout(() => setFailed(4.2), 300);
  }, []);

  const totalDocs = MOCK_DASHBOARD_STATS.totalDocuments;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
      <Heading level={4}>Processing Summary</Heading>
      <VStack gap={4}>
        <HStack gap={3} align="center">
          <div style={{ width: 10, height: 10, borderRadius: 6, backgroundColor: CHART_COLORS.success }} />
          <Text weight="medium" size="sm">Processed</Text>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <Heading level={4} style={{ letterSpacing: '-0.02em', lineHeight: 1 }}>87.5%</Heading>
          </div>
        </HStack>
        <div style={{ height: 10, borderRadius: 5, backgroundColor: 'var(--color-overlay-hover)', overflow: 'hidden' }}>
          <div style={{ width: `${ready}%`, height: '100%', backgroundColor: CHART_COLORS.success, borderRadius: 5, transition: 'width 0.8s ease' }} />
        </div>
        <HStack gap={3} align="center">
          <div style={{ width: 10, height: 10, borderRadius: 6, backgroundColor: CHART_COLORS.warning }} />
          <Text weight="medium" size="sm">Pending</Text>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <Heading level={4} style={{ letterSpacing: '-0.02em', lineHeight: 1 }}>8.3%</Heading>
          </div>
        </HStack>
        <div style={{ height: 10, borderRadius: 5, backgroundColor: 'var(--color-overlay-hover)', overflow: 'hidden' }}>
          <div style={{ width: `${processing}%`, height: '100%', backgroundColor: CHART_COLORS.warning, borderRadius: 5, transition: 'width 0.8s ease' }} />
        </div>
        <HStack gap={3} align="center">
          <div style={{ width: 10, height: 10, borderRadius: 6, backgroundColor: CHART_COLORS.error }} />
          <Text weight="medium" size="sm">Failed</Text>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <Heading level={4} style={{ letterSpacing: '-0.02em', lineHeight: 1 }}>4.2%</Heading>
          </div>
        </HStack>
        <div style={{ height: 10, borderRadius: 5, backgroundColor: 'var(--color-overlay-hover)', overflow: 'hidden' }}>
          <div style={{ width: `${failed}%`, height: '100%', backgroundColor: CHART_COLORS.error, borderRadius: 5, transition: 'width 0.8s ease' }} />
        </div>
      </VStack>
      <div style={{ flex: 1 }} />
      <HStack gap={2} justify="center" style={{ flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: totalDocs, color: CHART_COLORS.accent },
          { label: 'Processed', value: Math.round(totalDocs * 0.875), color: CHART_COLORS.success },
          { label: 'Pending', value: Math.round(totalDocs * 0.083), color: CHART_COLORS.warning },
          { label: 'Failed', value: Math.round(totalDocs * 0.042), color: CHART_COLORS.error },
        ].map(s => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8,
            backgroundColor: 'var(--color-overlay-hover)',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
            <Text size="sm" weight="medium">{s.label}</Text>
            <Text size="sm" type="supporting">{s.value}</Text>
          </div>
        ))}
      </HStack>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <VStack gap={6}>
      <Heading level={2}>Dashboard</Heading>

      <Grid columns={{ minWidth: 220 }} gap={4}>
        {statCards.map((card, i) => (
          <Card key={card.label} padding={0} style={{ overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            <VStack gap={0}>
              <div style={{ height: 3, backgroundColor: iconColors[i] }} />
              <div style={{ padding: '22px 24px 24px' }}>
                <VStack gap={5}>
                  <HStack align="center" gap={3}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      backgroundColor: 'var(--color-overlay-hover)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: iconColors[i],
                    }}>
                      {card.icon}
                    </div>
                    <Text type="supporting" size="sm">{card.label}</Text>
                  </HStack>
                  <HStack align="end" justify="between">
                    <Heading level={2} style={{ letterSpacing: '-0.03em', lineHeight: 1 }}>{card.value}</Heading>
                    <Badge variant={card.changeType} label={card.change} />
                  </HStack>
                </VStack>
              </div>
            </VStack>
          </Card>
        ))}
      </Grid>

      <Grid columns={2} gap={4}>
        <Card padding={4}>
          <VStack gap={3}>
            <HStack align="center" justify="between">
              <Heading level={4}>Documents Uploaded</Heading>
              <HStack gap={2} align="center">
                <TrendingUp size={14} color="var(--color-success, #0D8626)" />
                <Text type="supporting" size="sm">+12% vs last month</Text>
              </HStack>
            </HStack>
            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer>
                <BarChart data={MOCK_MONTHLY_DATA} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.accent} stopOpacity={1} />
                      <stop offset="100%" stopColor={CHART_COLORS.accent} stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke={CHART_COLORS.border} vertical={false} strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: CHART_COLORS.textSecondary, fontWeight: 500 }} axisLine={false} tickLine={false} dy={6} />
                  <YAxis tick={{ fontSize: 12, fill: CHART_COLORS.textSecondary }} axisLine={false} tickLine={false} dx={-4} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-hover, #f5f5f5)', opacity: 0.4 }} />
                  <Bar dataKey="documents" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </VStack>
        </Card>

        <Card padding={4}>
          <VStack gap={3}>
            <HStack align="center" justify="between">
              <Heading level={4}>Questions Asked</Heading>
              <HStack gap={2} align="center">
                <TrendingDown size={14} color="var(--color-warning, #D2A100)" />
                <Text type="supporting" size="sm">-3% vs last month</Text>
              </HStack>
            </HStack>
            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer>
                <AreaChart data={MOCK_MONTHLY_DATA} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke={CHART_COLORS.border} vertical={false} strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: CHART_COLORS.textSecondary, fontWeight: 500 }} axisLine={false} tickLine={false} dy={6} />
                  <YAxis tick={{ fontSize: 12, fill: CHART_COLORS.textSecondary }} axisLine={false} tickLine={false} dx={-4} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="questions" stroke={CHART_COLORS.success} strokeWidth={2.5} fill="url(#areaGrad)" dot={{ r: 3, fill: CHART_COLORS.success, strokeWidth: 2, stroke: 'var(--color-surface, #fff)' }} activeDot={{ r: 6, fill: CHART_COLORS.success, strokeWidth: 2, stroke: 'var(--color-surface, #fff)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </VStack>
        </Card>
      </Grid>

      <Grid columns={2} gap={4}>
        <Card padding={4}>
          <VStack gap={3}>
            <Heading level={4}>Document Type Distribution</Heading>
            <div style={{ width: '100%', height: 230, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', zIndex: 1 }}>
                <Heading level={3} style={{ letterSpacing: '-0.03em', lineHeight: 1 }}>{MOCK_DASHBOARD_STATS.totalDocuments}</Heading>
                <Text type="supporting" size="sm">total</Text>
              </div>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={MOCK_DOC_TYPE_DIST.map(d => ({ name: d.label, value: d.count }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    dataKey="value"
                    stroke="var(--color-surface, #fff)"
                    strokeWidth={3}
                  >
                    {MOCK_DOC_TYPE_DIST.map((_, i) => (
                      <Cell key={i} fill={donutColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {MOCK_DOC_TYPE_DIST.map((d, i) => (
                <div key={d.type} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 8,
                  backgroundColor: 'var(--color-overlay-hover)',
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: donutColors[i], flexShrink: 0 }} />
                  <Text size="sm" weight="medium">{d.label}</Text>
                  <Text size="sm" type="supporting">({d.count})</Text>
                </div>
              ))}
            </div>
          </VStack>
        </Card>

        <Card padding={4} style={{ display: 'flex' }}>
          <AnimatedProgressBars />
        </Card>
      </Grid>

      <Card padding={4}>
        <VStack gap={4}>
          <HStack align="center" justify="between">
            <Heading level={4}>Recent Documents</Heading>
            <HStack gap={1} align="center" style={{ cursor: 'pointer', opacity: 0.6 }}>
              <Text size="sm" weight="medium">View All</Text>
              <ArrowRight size={14} />
            </HStack>
          </HStack>
          <Table dividers="rows" density="compact" hasHover>
            <TableHeader>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Upload Date</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Size</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {recentDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div style={{ paddingBlock: 8 }}>
                      <HStack gap={2} align="center">
                        <File size={14} />
                        <Text weight="medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{doc.name}</Text>
                      </HStack>
                    </div>
                  </TableCell>
                  <TableCell><div style={{ paddingBlock: 8 }}><Text type="supporting">{documentTypeLabel(doc.type)}</Text></div></TableCell>
                  <TableCell><div style={{ paddingBlock: 8 }}><Text type="supporting">{doc.uploadDate}</Text></div></TableCell>
                  <TableCell>
                    <div style={{ paddingBlock: 8 }}>
                      <HStack gap={2} align="center">
                        <Badge variant={documentStatusVariant(doc.status)} label={doc.status} />
                      </HStack>
                    </div>
                  </TableCell>
                  <TableCell><div style={{ paddingBlock: 8 }}><Text type="supporting">{doc.size}</Text></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </VStack>
      </Card>
    </VStack>
  );
}
