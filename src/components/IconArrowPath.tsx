import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface IconProps {
  className?: string;
}

const IconArrowPath: React.FC<IconProps> = ({ className }) => {
  return <ArrowPathIcon className={className || "h-6 w-6"} />;
};

export default IconArrowPath;
