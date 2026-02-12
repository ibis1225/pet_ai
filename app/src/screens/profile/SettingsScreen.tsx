import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../lib/theme';

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>알림</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>푸시 알림</Text>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={pushEnabled ? colors.primary : colors.textLight}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>앱 설정</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>다크 모드</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={darkMode ? colors.primary : colors.textLight}
          />
        </View>
        <View style={[styles.settingRow, styles.settingRowBorder]}>
          <Text style={styles.settingLabel}>언어</Text>
          <Text style={styles.settingValue}>한국어</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>정보</Text>
      <View style={styles.settingsGroup}>
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingLabel}>이용약관</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder]}>
          <Text style={styles.settingLabel}>개인정보처리방침</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        </TouchableOpacity>
        <View style={[styles.settingRow, styles.settingRowBorder]}>
          <Text style={styles.settingLabel}>앱 버전</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.dangerBtn}>
        <Text style={styles.dangerText}>회원 탈퇴</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    paddingLeft: spacing.sm,
    marginTop: spacing.md,
  },
  settingsGroup: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  settingLabel: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  settingValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  dangerBtn: {
    alignItems: 'center',
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  dangerText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
});
