/**
 * "How to do it" — the instruction surface.
 *
 * A separate surface, not an inline panel. The workout player is at its density
 * limit already, and an expanding block would reflow the screen mid-session and
 * push the primary action below the fold. A sheet leaves the player exactly
 * where it was.
 *
 * It renders what it is given. It does not know which movement it is showing,
 * whether that movement has a context, or what a step's phase was — the caller
 * hands it an ordered list of sentences, and a context-resolved instruction for
 * a movement performed on a bench arrives here indistinguishable from one
 * performed on the ground. That is what keeps a future split squat from needing
 * a change in this file.
 *
 * Steps are numbered rather than labelled. `setup`, `action` and `return` are
 * how the content model proves an instruction is complete; a person reading one
 * needs the order, which the numbers already carry.
 *
 * The provenance note travels with the content. It is persistent on the player
 * for the whole session, and a sheet that covered it while showing project-
 * created instructions would be the one moment it was hidden.
 */
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CLOSE_INSTRUCTIONS_LABEL,
  INSTRUCTION_HEADING,
  openInstructionsLabel,
} from '../../src/presentation/instruction-copy.ts';
import { ProjectContentNote } from './project-content-note';
import { gutter, radius, space, touch, type, useTheme } from '../theme/tokens';

export function InstructionSheet({
  visible,
  movementName,
  steps,
  reduceMotion,
  onClose,
}: {
  readonly visible: boolean;
  readonly movementName: string;
  readonly steps: readonly string[];
  readonly reduceMotion: boolean;
  readonly onClose: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType={reduceMotion ? 'none' : 'slide'}
      presentationStyle="pageSheet"
    >
      <View
        accessibilityViewIsModal
        style={{ flex: 1, backgroundColor: t.color.cloud, paddingTop: insets.top }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: space.md,
            paddingHorizontal: gutter,
            paddingTop: space.lg,
            paddingBottom: space.md,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ ...type.micro, color: t.color.navyFaint, textTransform: 'uppercase' }}>
              {INSTRUCTION_HEADING}
            </Text>
            <Text
              accessibilityRole="header"
              style={{ ...type.title, color: t.color.navy, marginTop: space.xs }}
            >
              {movementName}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={CLOSE_INSTRUCTIONS_LABEL}
            style={{
              minHeight: touch.min,
              minWidth: touch.min,
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <Text style={{ ...type.label, color: t.color.blue }}>{CLOSE_INSTRUCTIONS_LABEL}</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: gutter,
            paddingBottom: Math.max(insets.bottom, space.xl),
          }}
        >
          {/* No fixed count assumed: three steps and four lay out identically. */}
          {steps.map((text, index) => (
            <View
              key={text}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: space.md,
                paddingVertical: space.md,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: t.color.line,
              }}
            >
              <Text
                style={{
                  ...type.label,
                  color: t.color.blueVivid,
                  fontVariant: ['tabular-nums'],
                  minWidth: 20,
                }}
              >
                {index + 1}
              </Text>
              <Text style={{ flex: 1, ...type.lead, color: t.color.navy }}>{text}</Text>
            </View>
          ))}

          <View style={{ marginTop: space.lg }}>
            <ProjectContentNote />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
