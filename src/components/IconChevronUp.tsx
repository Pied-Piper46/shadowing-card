import { ChevronUpIcon } from '@heroicons/react/24/outline';

interface IconProps {
  className?: string;
}

const IconChevronUp: React.FC<IconProps> = ({ className }) => {
  return <ChevronUpIcon className={className || "h-6 w-6"} />;
};

export default IconChevronUp;
