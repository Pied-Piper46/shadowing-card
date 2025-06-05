import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface IconProps {
  className?: string;
}

const IconChevronDown: React.FC<IconProps> = ({ className }) => {
  return <ChevronDownIcon className={className || "h-6 w-6"} />;
};

export default IconChevronDown;
