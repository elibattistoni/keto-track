import { Text, TextProps } from '@mantine/core';

export function KetoTrack(props: TextProps) {
  return (
    <Text inherit component="span" {...props}>
      <span style={{ color: 'var(--mantine-color-brandViolet-4)' }}>Keto</span>
      <span style={{ color: 'var(--mantine-color-brandGreen-4)' }}>Track</span>
    </Text>
  );
}
