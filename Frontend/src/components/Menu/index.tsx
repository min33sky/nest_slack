import React, { CSSProperties, useCallback } from 'react';

import { CloseModalButton, CreateMenu } from './style';

interface IProps {
  children: React.ReactNode;
  onCloseModal: (_e: React.MouseEvent) => void;
  style: CSSProperties;
  show: boolean;
  closeButton?: boolean;
}

function Menu({ children, onCloseModal, style, show, closeButton }: IProps) {
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!show) return null;

  return (
    <CreateMenu onClick={onCloseModal}>
      <div role="presentation" style={style} onClick={stopPropagation}>
        {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
    </CreateMenu>
  );
}

Menu.defaultProps = {
  closeButton: true,
};

export default Menu;
