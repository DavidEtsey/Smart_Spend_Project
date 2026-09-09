import { useEffect } from "react";
import { Box, Text } from "@gluestack-ui/themed";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";
import { useSettings } from "../../app/contexts/settingsContext";
import { formatCurrency } from "../../app/helpers/formatCurrency";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BudgetRing({
  progress = 0,
  remaining = 0,
  budget = 0,
  size = 170,
  strokeWidth = 14
}) {
  const { settings } = useSettings();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const safeProgress = Math.max(
      0,
      Math.min(Number(progress) || 0, 100)
    );

    animatedProgress.value = withTiming(safeProgress, {
      duration: 900,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset:
      circumference - (circumference * animatedProgress.value) / 100,
  }));

  const progressColor = "#16A34A";
  
  return (
    <Box alignItems="center" justifyContent="center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated Progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center Content */}
      {budget === 0 ? (
        <Box position="absolute" alignItems="center"></Box>
      ) : (
        <Box position="absolute" alignItems="center" justifyContent="center">
          <Text
            fontSize="$2xl"
            fontWeight="$medium"
            color={remaining > 0 ? "$green700" : "$red600"}
          >
            {formatCurrency(remaining, settings.currency)}
          </Text>

          <Text fontSize="$sm" color="$coolGray500" mt="$1">
            Remaining
          </Text>

          <Text fontSize="$xs" color="$coolGray400" mt="$1">
            of {formatCurrency(budget, settings.currency)} Budget
          </Text>
        </Box>
      )}
    </Box>
  );
}
