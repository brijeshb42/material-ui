import { BaseProcessor, ValueType, validateParams } from '@linaria/tags';
import type {
  CallParam,
  Expression,
  Params,
  Replacements,
  Rules,
  TailProcessorParams,
  ValueCache,
} from '@linaria/tags';
import { WithStitchesOptions, processCssObject } from './common';

export default class InlineCssProcessor extends BaseProcessor {
  params: CallParam;

  constructor(params: Params, ...args: TailProcessorParams) {
    super(params, ...args);

    if (this.tagSource.source !== '@mui/no-stitches/runtime') {
      throw BaseProcessor.SKIP;
    }

    validateParams(params, ['callee', 'call'], `Invalid use of ${this.tagSource.imported} tag.`);
    const [, callParams] = params;

    if (callParams.length !== 2) {
      throw new Error(
        `Invalid use of ${this.tagSource.imported} tag. It should have exactly one argument.`,
      );
    }

    this.params = callParams;
  }

  build(values: ValueCache): void {
    const [, cssObject] = this.params;
    if (cssObject.kind === ValueType.CONST) {
      return;
    }
    const builtObject = values.get(cssObject.ex.name) as Object;

    const { cssText } = processCssObject(builtObject, {
      baseClass: this.className,
      readableVariantClass: false,
      isInline: true,
      ...(this.options as WithStitchesOptions),
    });

    const cssRules: Rules = {
      [this.asSelector]: {
        className: this.className,
        cssText,
        displayName: this.displayName,
        start: this.location?.start,
      },
    };

    // @TODO - Refine exact source location later.
    const sourceMapReplacements: Replacements = [
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
    this.artifacts.push(['css', [cssRules, sourceMapReplacements]]);
  }

  doEvaltimeReplacement(): void {
    this.replacer(this.value, false);
  }

  doRuntimeReplacement(): void {
    this.replacer(this.value, false);
  }

  public override get asSelector(): string {
    return `.${this.className}`;
  }

  get value(): Expression {
    return this.astService.stringLiteral(this.className);
  }
}
