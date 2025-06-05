import { LightBulbIcon } from '@heroicons/react/24/outline';

interface IconProps {
  className?: string;
}

const IconLightBulb: React.FC<IconProps> = ({ className }) => {
  return <LightBulbIcon className={className || "h-6 w-6"} />;
};

export default IconLightBulb;
