import type { Expression, Params, TailProcessorParams, ValueCache } from '@linaria/tags';
import { BaseProcessor, validateParams } from '@linaria/tags';
import { ValueType, type ExpressionValue, type Replacements, type Rules } from '@linaria/utils';
import type { IOptions } from './styled';
import { processCssObject } from './utils/processCssObject';

export default class SxProcessor extends BaseProcessor {
  sxArguments: ExpressionValue[] = [];

  constructor(params: Params, ...args: TailProcessorParams) {
    super(params, ...args);
    validateParams(params, ['callee', 'call'], 'Invalid usage of sx call.');
    const [, [, ...sxCallArguments]] = params;
    sxCallArguments.forEach((arg) => {
      if ('kind' in arg) {
        this.dependencies.push(arg);
      }
    });
    this.sxArguments = sxCallArguments;
  }

  build(values: ValueCache) {
    const [sxStyle, elementClassExpression] = this.sxArguments;
    let elementClassName = '';
    if (elementClassExpression.kind === ValueType.LAZY) {
      const elementClassValue = values.get(elementClassExpression.ex.name);
      if (typeof elementClassValue === 'string') {
        elementClassName = elementClassValue;
      }
    }

    let cssText: string = '';
    if (sxStyle.kind === ValueType.CONST) {
      if (sxStyle.ex.type === 'StringLiteral') {
        cssText = sxStyle.ex.value;
      }
    } else {
      const styleObjOrFn = values.get(sxStyle.ex.name);
      cssText = this.processCss(styleObjOrFn);
    }
    const selector = elementClassName ? `.${elementClassName}${this.asSelector}` : this.asSelector;

    if (!cssText) {
      return;
    }

    const rules: Rules = {
      [selector]: {
        className: this.className,
        cssText,
        displayName: this.displayName,
        start: this.location?.start ?? null,
      },
    };
    const replacements: Replacements = [
      {
        length: cssText.length,
        original: {
          start: {
            column: this.location?.start.column ?? 0,
            line: this.location?.start.line ?? 0,
          },
          end: {
            column: this.location?.end.column ?? 0,
            line: this.location?.end.line ?? 0,
          },
        },
      },
    ];
    this.artifacts.push(['css', [rules, replacements]]);
  }

  doEvaltimeReplacement() {
    this.replacer(this.value, false);
  }

  doRuntimeReplacement() {
    this.replacer(this.value, false);
  }

  get asSelector(): string {
    return `.${this.className}`;
  }

  get value(): Expression {
    return this.astService.stringLiteral(this.className);
  }

  private processCss(styleObjOrFn: unknown) {
    const { themeArgs } = this.options as IOptions;
    const styleObj = typeof styleObjOrFn === 'function' ? styleObjOrFn(themeArgs) : styleObjOrFn;
    return processCssObject(styleObj, themeArgs);
  }
}
