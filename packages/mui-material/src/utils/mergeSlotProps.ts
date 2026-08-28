import { SlotComponentProps } from '@mui/utils/types';
import isEventHandler from '@mui/utils/isEventHandler';
import setRef from '@mui/utils/setRef';
import clsx from 'clsx';

function composeRefs<T>(
  refA: React.Ref<T> | undefined,
  refB: React.Ref<T> | undefined,
): React.RefCallback<T> {
  return (instance: T | null) => {
    setRef(refA as React.MutableRefObject<T | null> | ((instance: T | null) => void), instance);
    setRef(refB as React.MutableRefObject<T | null> | ((instance: T | null) => void), instance);
  };
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
      const composedRef =
        defaultSlotPropsValue?.ref && externalSlotPropsValue?.ref
          ? { ref: composeRefs(externalSlotPropsValue.ref, defaultSlotPropsValue.ref) }
          : undefined;

      return {
        ...defaultSlotPropsValue,
        ...externalSlotPropsValue,
        ...handlers,
        ...composedRef,
        ...(!!className && { className }),
        ...(defaultSlotPropsValue?.style &&
          externalSlotPropsValue?.style && {
            style: { ...defaultSlotPropsValue.style, ...externalSlotPropsValue.style },
          }),
        ...(defaultSlotPropsValue?.sx &&
          externalSlotPropsValue?.sx && {
            sx: [
              ...(Array.isArray(defaultSlotPropsValue.sx)
                ? defaultSlotPropsValue.sx
                : [defaultSlotPropsValue.sx]),
              ...(Array.isArray(externalSlotPropsValue.sx)
                ? externalSlotPropsValue.sx
                : [externalSlotPropsValue.sx]),
            ],
          }),
      };
    }) as U;
  }
  const typedDefaultSlotProps = defaultSlotProps as Record<string, any>;
  const handlers = extractHandlers(externalSlotProps, typedDefaultSlotProps);
  const className = clsx(typedDefaultSlotProps?.className, externalSlotProps?.className);
  const composedRef =
    typedDefaultSlotProps?.ref && (externalSlotProps as Record<string, any>)?.ref
      ? {
          ref: composeRefs(
            (externalSlotProps as Record<string, any>).ref,
            typedDefaultSlotProps.ref,
          ),
        }
      : undefined;
  return {
    ...defaultSlotProps,
    ...externalSlotProps,
    ...handlers,
    ...composedRef,
    ...(!!className && { className }),
    ...(typedDefaultSlotProps?.style &&
      externalSlotProps?.style && {
        style: { ...typedDefaultSlotProps.style, ...externalSlotProps.style },
      }),
    ...(typedDefaultSlotProps?.sx &&
      externalSlotProps?.sx && {
        sx: [
          ...(Array.isArray(typedDefaultSlotProps.sx)
            ? typedDefaultSlotProps.sx
            : [typedDefaultSlotProps.sx]),
          ...(Array.isArray(externalSlotProps.sx) ? externalSlotProps.sx : [externalSlotProps.sx]),
        ],
      }),
  } as U;
}
