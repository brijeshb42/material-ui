import * as React from 'react';
import { SlotComponentProps } from '@mui/utils/types';
import isEventHandler from '@mui/utils/isEventHandler';
import clsx from 'clsx';
import setRef from './setRef';

function mergeRefProp(
  defaultRef: React.Ref<unknown> | undefined,
  externalRef: React.Ref<unknown> | undefined,
): React.RefCallback<unknown> | React.Ref<unknown> | undefined {
  if (defaultRef == null) {
    return externalRef;
  }
  if (externalRef == null) {
    return defaultRef;
  }
  return (instance: unknown) => {
    setRef(defaultRef, instance);
    setRef(externalRef, instance);
  };
}

function finalizeMergedSlotProps(
  defaultSlotPropsValue: Record<string, any> | undefined,
  externalSlotPropsValue: Record<string, any> | undefined,
  handlers: Record<string, Function>,
  className: string,
) {
  const result: Record<string, any> = {
    ...defaultSlotPropsValue,
    ...externalSlotPropsValue,
    ...handlers,
  };
  if (className) {
    result.className = className;
  }
  if (defaultSlotPropsValue?.style && externalSlotPropsValue?.style) {
    result.style = { ...defaultSlotPropsValue.style, ...externalSlotPropsValue.style };
  }
  if (defaultSlotPropsValue?.sx && externalSlotPropsValue?.sx) {
    result.sx = [
      ...(Array.isArray(defaultSlotPropsValue.sx)
        ? defaultSlotPropsValue.sx
        : [defaultSlotPropsValue.sx]),
      ...(Array.isArray(externalSlotPropsValue.sx)
        ? externalSlotPropsValue.sx
        : [externalSlotPropsValue.sx]),
    ];
  }
  if (defaultSlotPropsValue?.ref != null || externalSlotPropsValue?.ref != null) {
    result.ref = mergeRefProp(defaultSlotPropsValue?.ref, externalSlotPropsValue?.ref);
  }
  return result;
}

export default function mergeSlotProps<
  T extends SlotComponentProps<React.ElementType, {}, {}>,
  K = T,
  // infer external slot props first to provide autocomplete for default slot props
  U = T extends Function ? T : K extends Function ? K : T extends undefined ? K : T,
>(externalSlotProps: T | undefined, defaultSlotProps: K): U {
  if (!externalSlotProps) {
    return defaultSlotProps as unknown as U;
  }
  function extractHandlers(
    externalSlotPropsValue: Record<string, any>,
    defaultSlotPropsValue: Record<string, any>,
  ) {
    const handlers: Record<string, Function> = {};

    Object.keys(defaultSlotPropsValue).forEach((key) => {
      if (
        isEventHandler(key, defaultSlotPropsValue[key]) &&
        typeof externalSlotPropsValue[key] === 'function'
      ) {
        // only compose the handlers if both default and external slot props match the event handler
        handlers[key] = (...args: unknown[]) => {
          externalSlotPropsValue[key](...args);
          defaultSlotPropsValue[key](...args);
        };
      }
    });
    return handlers;
  }
  if (typeof externalSlotProps === 'function' || typeof defaultSlotProps === 'function') {
    return ((ownerState: Record<string, any>) => {
      const defaultSlotPropsValue =
        typeof defaultSlotProps === 'function' ? defaultSlotProps(ownerState) : defaultSlotProps;
      const externalSlotPropsValue =
        typeof externalSlotProps === 'function'
          ? externalSlotProps({ ...ownerState, ...defaultSlotPropsValue })
          : externalSlotProps;

      const className = clsx(
        ownerState?.className,
        defaultSlotPropsValue?.className,
        externalSlotPropsValue?.className,
      );
      const handlers = extractHandlers(externalSlotPropsValue, defaultSlotPropsValue);

      return finalizeMergedSlotProps(
        defaultSlotPropsValue,
        externalSlotPropsValue,
        handlers,
        className,
      );
    }) as U;
  }
  const typedDefaultSlotProps = defaultSlotProps as Record<string, any>;
  const handlers = extractHandlers(externalSlotProps, typedDefaultSlotProps);
  const className = clsx(typedDefaultSlotProps?.className, externalSlotProps?.className);
  return finalizeMergedSlotProps(
    typedDefaultSlotProps,
    externalSlotProps,
    handlers,
    className,
  ) as U;
}
