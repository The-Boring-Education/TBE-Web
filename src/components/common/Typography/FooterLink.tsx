import { Link } from '@/components';
import { FooterLinkProps } from '@/interfaces';

const FooterLink = ({ href, label, target }: FooterLinkProps) => {
  return (
    <li className='mt-1'>
      <Link
        href={href}
        className='paragraph font-normal text-contentDark transition hover:text-primary'
        target={target}
      >
        {label}
      </Link>
    </li>
  );
};

export default FooterLink;
