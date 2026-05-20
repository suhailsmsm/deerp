import { type PropsWithChildren } from 'react';
import { Linking, Text, type TextProps } from 'react-native';

type Props = PropsWithChildren<
  TextProps & {
    href: string;
  }
>;

export function ExternalLink({ href, children, onPress, ...rest }: Props) {
  return (
    <Text
      accessibilityRole="link"
      {...rest}
      onPress={(event) => {
        onPress?.(event);
        void Linking.openURL(href);
      }}
    >
      {children ?? href}
    </Text>
  );
}
