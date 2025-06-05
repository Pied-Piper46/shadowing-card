import { SpeakerXMarkIcon } from '@heroicons/react/24/outline';

interface IconProps {
  className?: string;
}

const IconVolumeOff: React.FC<IconProps> = ({ className }) => {
  return <SpeakerXMarkIcon className={className || "h-6 w-6"} />;
};

export default IconVolumeOff;
