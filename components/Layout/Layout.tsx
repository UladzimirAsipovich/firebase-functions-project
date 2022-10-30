import type { PropsWithChildren } from 'react';

const Layout: React.FC<PropsWithChildren> = (props): JSX.Element => {

  return (
    <>
      {props.children}
    </>
  );
};

export default Layout;