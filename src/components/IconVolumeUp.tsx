// src/components/IconVolumeUp.tsx
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

interface IconProps {
  className?: string;
}

const IconVolumeUp: React.FC<IconProps> = ({ className }) => {
  return <SpeakerWaveIcon className={className || "h-6 w-6"} />;
};

export default IconVolumeUp;

// 同様に src/components/IconVolumeOff.tsx (SpeakerXMarkIcon) も作成
// src/components/IconChevronUp.tsx (ChevronUpIcon)
// src/components/IconChevronDown.tsx (ChevronDownIcon)
// src/components/IconArrowPath.tsx (ArrowPathIcon for "repeat")
// src/components/IconLightBulb.tsx (LightBulbIcon for "explanation")