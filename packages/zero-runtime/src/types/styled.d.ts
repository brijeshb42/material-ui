import type * as React from 'react';
import type * as CSS from 'csstype';
// import type * as Emotion from '@emotion/styled';

// export interface StyledComponentProps

type CSSProperties = CSS.PropertiesFallback<number | string>;

export interface ThemeArgs {}

export type CSSPseudos<Props extends {}> = { [K in CSS.Pseudos]?: CSSObject<Props> };

export type CSSPseudosNoProps = { [K in CSS.Pseudos]?: CSSObjectNoProps };

export type CSSPropertiesWithNoProps = {
  [Key in keyof CSSProperties]: CSSProperties[Key] | Array<Extract<CSSProperties[Key], string>>;
};

export type CSSPropertiesWithPropsCallback<Props extends {}> = {
  [Key in keyof CSSProperties]:
    | CSSProperties[Key]
    | Array<Extract<CSSProperties[Key], string>>
    | ((props: Props) => CSSProperties[Key]);
};

interface CSSOthersObject<Props extends {}> {
  [propertyName: string]: CSSObject<Props>;
}

export type CSSObjectNoProps = CSSPropertiesWithNoProps & CSSPseudosNoProps;

export type CSSObject<Props extends {}> = CSSPropertiesWithPropsCallback<Props> & CSSPseudos<Props>;

interface SxProps extends CSSObjectNoProps {}

export interface StyledComponent<
  ComponentProps,
  SpecificComponentProps extends {} = {},
  JSXProps extends {} = {},
> extends React.FC<ComponentProps & SpecificComponentProps & JSXProps> {}

interface CreateStyledOptions<Props extends {}> {
  // @TODO - More to be added as and when we start using them.
  name?: string;
  slot?: string;
  overridesResolver?: (props: Props) => string | string[];
}

interface CreateStyledWithThemeCallback<Props extends {}> {
  (args: ThemeArgs): CSSObject<Props>;
}

interface CreateStyledComponent<ComponentProps> {
  /**
   * @typeparam UserProps Extra props added by the user to the component.
   */
  <UserProps extends {} = {}>(
    ...styles: (
      | CreateStyledWithThemeCallback<ThemeArgs>
      | CSSObject<ComponentProps & UserProps>
      | string
    )[]
  ): StyledComponent<ComponentProps, UserProps, { sx?: SxProps }>;
}

export interface BaseCreateStyled {
  <Component extends React.ComponentClass<React.ComponentProps<Component>>>(
    component: Component,
    options?: CreateStyledOptions<{}>,
  ): CreateStyledComponent<React.ComponentProps<Component>>;
  <Tag extends keyof JSX.IntrinsicElements>(
    tag: Tag,
    options?: CreateStyledOptions<{}>,
  ): CreateStyledComponent<JSX.IntrinsicElements[Tag]>;
}

export type StyledTags = {
  [Tag in keyof JSX.IntrinsicElements]: CreateStyledComponent<JSX.IntrinsicElements[Tag]>;
};

export interface CreateStyled extends BaseCreateStyled, StyledTags {}
