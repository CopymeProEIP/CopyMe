import { TouchableOpacity, Linking } from 'react-native';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

type Props = Omit<ComponentProps<typeof TouchableOpacity>, 'onPress'> & { href: string };

export function ExternalLink({ href, children, ...rest }: Props) {
  return (
    <TouchableOpacity
      {...rest}
      onPress={async () => {
        if (Platform.OS !== 'web') {
          await Linking.openURL(href);
        }
      }}
    >
      {children}
    </TouchableOpacity>
  );
}
