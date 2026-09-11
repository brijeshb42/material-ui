import { SlotComponentProps } from '@mui/utils/types';
import isEventHandler from '@mui/utils/isEventHandler';
import clsx from 'clsx';

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
  function mergeRefs(
    defaultRef: any,
    externalRef: any,
  ) {
    if (!defaultRef) {
      return externalRef;
    }
    if (!externalRef) {
      return defaultRef;
    }
    return (node: any) => {
      if (typeof defaultRef === 'function') {
        defaultRef(node);
      } else if (defaultRef != null) {
        defaultRef.current = node;
      }
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else if (externalRef != null) {
        externalRef.current = node;
      }
    };
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
      if (defaultSlotPropsValue?.ref || externalSlotPropsValue?.ref) {
        result.ref = mergeRefs(defaultSlotPropsValue?.ref, externalSlotPropsValue?.ref);
      }
      return result;
    }) as U;
  }
  const typedDefaultSlotProps = defaultSlotProps as Record<string, any>;
  const handlers = extractHandlers(externalSlotProps, typedDefaultSlotProps);
  const className = clsx(typedDefaultSlotProps?.className, externalSlotProps?.className);
  const result: Record<string, any> = {
    ...defaultSlotProps,
    ...externalSlotProps,
    ...handlers,
  };
  if (className) {
    result.className = className;
  }
  if (typedDefaultSlotProps?.style && externalSlotProps?.style) {
    result.style = { ...typedDefaultSlotProps.style, ...externalSlotProps.style };
  }
  if (typedDefaultSlotProps?.sx && externalSlotProps?.sx) {
    result.sx = [
      ...(Array.isArray(typedDefaultSlotProps.sx)
        ? typedDefaultSlotProps.sx
        : [typedDefaultSlotProps.sx]),
      ...(Array.isArray(externalSlotProps.sx) ? externalSlotProps.sx : [externalSlotProps.sx]),
    ];
  }
  if (typedDefaultSlotProps?.ref || externalSlotProps?.ref) {
    result.ref = mergeRefs(typedDefaultSlotProps?.ref, externalSlotProps?.ref);
  }
  return result as U;
}
