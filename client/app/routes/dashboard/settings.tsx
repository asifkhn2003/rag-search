'use client';

import { useState } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Switch } from '@astryxdesign/core/Switch';
import { TextInput } from '@astryxdesign/core/TextInput';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { useToast } from '@astryxdesign/core/Toast';
import { useTheme } from './layout';
import { AlertTriangle, Trash2, Sun, Moon, User, Palette, Save, Shield } from 'lucide-react';

const accentColor = 'var(--color-accent, #0064E0)';
const warningColor = 'var(--color-warning, #D2A100)';
const errorColor = 'var(--color-error, #E3193B)';

function IconBox({ icon, color }: { icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      backgroundColor: 'var(--color-overlay-hover)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, flexShrink: 0,
    }}>
      {icon}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: 'var(--color-border, #e0e0e0)', width: '100%' }} />;
}

export default function SettingsPage() {
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex@example.com');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = () => {
    toast({ body: 'Profile saved successfully' });
  };

  const handleDeleteAll = () => {
    setShowDeleteConfirm(false);
    toast({ body: 'All documents deleted permanently', type: 'error' });
  };

  return (
    <VStack gap={6}>
      <div>
        <Heading level={2}>Settings</Heading>
        <Text type="supporting" size="sm">Manage your account preferences and application configuration</Text>
      </div>

      <Card padding={5} style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
        <VStack gap={5}>
          <HStack gap={3} align="center">
            <IconBox icon={<Palette size={18} />} color={accentColor} />
            <div>
              <Heading level={4}>Appearance</Heading>
              <Text type="supporting" size="sm">Customize how the application looks</Text>
            </div>
          </HStack>
          <Divider />
          <HStack gap={3} align="center">
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
            <VStack gap={0.5}>
              <Text weight="medium">Theme</Text>
              <Text type="supporting" size="sm">Switch between light and dark mode</Text>
            </VStack>
            <div style={{ marginLeft: 'auto' }}>
              <Switch
                label="Dark mode"
                isLabelHidden
                value={theme === 'dark'}
                onChange={() => toggleTheme()}
              />
            </div>
          </HStack>
        </VStack>
      </Card>

      <Card padding={5} style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
        <VStack gap={5}>
          <HStack gap={3} align="center">
            <IconBox icon={<User size={18} />} color={accentColor} />
            <div>
              <Heading level={4}>Profile</Heading>
              <Text type="supporting" size="sm">Your personal account information</Text>
            </div>
          </HStack>
          <Divider />
          <VStack gap={3}>
            <TextInput
              label="Full Name"
              value={name}
              onChange={setName}
              style={{ maxWidth: 400 }}
            />
            <TextInput
              label="Email Address"
              value={email}
              onChange={setEmail}
              style={{ maxWidth: 400 }}
            />
          </VStack>
          <div>
            <Button
              label="Save Changes"
              variant="primary"
              icon={<Save size={16} />}
              onClick={handleSaveProfile}
            />
          </div>
        </VStack>
      </Card>

      <Card padding={5} style={{
        borderColor: errorColor,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(227, 25, 59, 0.1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
        }}>
        <VStack gap={5}>
          <HStack gap={3} align="center">
            <IconBox icon={<Shield size={18} />} color={errorColor} />
            <div>
              <Heading level={4}>Danger Zone</Heading>
              <Text type="supporting" size="sm">Irreversible destructive actions</Text>
            </div>
          </HStack>
          <Divider />
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            backgroundColor: 'var(--color-error-muted, #fef2f2)',
          }}>
            <HStack gap={4} align="center">
              <AlertTriangle size={20} style={{ color: errorColor, flexShrink: 0 }} />
              <VStack gap={1}>
                <Text weight="medium" style={{ color: errorColor }}>Destructive action warning</Text>
                <Text type="supporting" size="sm">
                  Deleting all documents will permanently remove your uploaded files and their vector
                  embeddings from the index. This action cannot be undone.
                </Text>
              </VStack>
            </HStack>
          </div>
          <div>
            <Button
              label="Delete All Documents"
              variant="destructive"
              icon={<Trash2 size={16} />}
              onClick={() => setShowDeleteConfirm(true)}
            />
          </div>
        </VStack>
      </Card>

      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <Card padding={6} style={{
            width: 420,
            animation: 'slideUp 0.2s ease-out',
            borderColor: errorColor,
          }} onClick={(e: any) => e.stopPropagation()}>
            <VStack gap={5}>
              <HStack gap={3} align="center">
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: 'var(--color-error-muted, #fef2f2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: errorColor,
                }}>
                  <Trash2 size={18} />
                </div>
                <div>
                  <Heading level={3}>Delete All Documents</Heading>
                  <Text type="supporting" size="sm">This action is irreversible</Text>
                </div>
              </HStack>
              <div style={{
                padding: '12px 16px', borderRadius: 8,
                backgroundColor: 'var(--color-overlay-hover)',
              }}>
                <Text size="sm">
                  This will permanently remove all <strong>{24}</strong> uploaded documents and their
                  vector embeddings from the index. Your account settings will not be affected.
                </Text>
              </div>
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                backgroundColor: 'var(--color-warning-muted, #fef9e7)',
                border: '1px solid var(--color-warning, #D2A100)',
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <AlertTriangle size={16} style={{ color: warningColor, flexShrink: 0, marginTop: 2 }} />
                <Text size="sm" type="supporting">
                  This action cannot be undone. Please make sure you have backed up any important data
                  before proceeding.
                </Text>
              </div>
              <Divider />
              <HStack gap={2} justify="end">
                <Button label="Cancel" variant="secondary" onClick={() => setShowDeleteConfirm(false)} />
                <Button
                  label="Delete Everything"
                  variant="destructive"
                  icon={<Trash2 size={16} />}
                  onClick={handleDeleteAll}
                />
              </HStack>
            </VStack>
          </Card>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}
    </VStack>
  );
}
