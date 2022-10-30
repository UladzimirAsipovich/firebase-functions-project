import { FC, PropsWithChildren, DetailedHTMLProps, ButtonHTMLAttributes, useState, useEffect } from 'react';
import style from './Button.module.css';

interface I_useButtonConfig {
  loading: "true" | undefined;
  disabled: boolean
}

export interface I_useButtonResult {
  params: I_useButtonConfig;
  controls: {
    processing: (status: boolean) => void;
  }

}

export const useButton: (action?: I_useButtonConfig) => I_useButtonResult = (action = { loading: undefined, disabled: false }) => {

  const [loading, setLoading] = useState<I_useButtonConfig["loading"]>(action.loading);
  const [disabled, setDisabled] = useState<boolean>(!!action.disabled);

  const processing = (status: boolean) => {
    if (status) {
      setLoading("true");
      setDisabled(true);
      return;
    }
    setLoading(undefined);
    setDisabled(false);
  };

  return { params: { loading, disabled }, controls: { processing } };
};


interface I_Button extends PropsWithChildren<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>> {
  theme?: "primary" | "success" | "info" | "warn" | "danger" | "basic";
  secondary?: boolean | undefined;
  outline?: boolean | undefined;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: I_useButtonConfig["loading"];
};

const Button: FC<I_Button> = ({ children, theme = "basic", secondary, outline, size = 'md', ...params }): JSX.Element => {

  return (
    <button {...params}
      className={`
      ${style.button} ${style[size]} ${style[theme]} 
      ${secondary ? style.secondary : ''} 
      ${outline ? style.outline : ''} 
      ${params.className ? params.className : ''}`
      }
    >
      {params.loading ? (
        <div className='flex'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 animate-spin mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span>Loading</span>
        </div>

      ) : (<div className='w-full'>{children}</div>)}
    </button>
  );
};

export default Button;