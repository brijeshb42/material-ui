import { ObjectProperty } from '@babel/types';
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

export default class CssProcessor extends BaseProcessor {
  params: CallParam;

  defaultVariants?: { [key: string]: string };

  variantToClassMapping: { [key: string]: { [key: string]: string } } = {};

  constructor(params: Params, ...args: TailProcessorParams) {
    super(params, ...args);

    if (
      this.tagSource.source !== '@mui/no-stitches/runtime' &&
      this.tagSource.source !== '@stitches/react' &&
      this.tagSource.source !== '@stitches/core'
    ) {
      throw BaseProcessor.SKIP;
    }
    validateParams(params, ['callee', 'call'], `Invalid use of ${this.tagSource.imported} tag.`);
    const [, callParams] = params;

    if (callParams.length !== 2) {
      throw new Error(
        `Invalid use of ${this.tagSource.imported} tag. It should have exactly one argument.`,
      );
    }

    if (callParams[1].source.includes('propsAsIs')) {
      throw BaseProcessor.SKIP;
    }

    this.params = callParams;
  }

  build(values: ValueCache): void {
    const [, cssObject] = this.params;
    if (cssObject.kind === ValueType.CONST) {
      return;
    }
    const builtObject = values.get(cssObject.ex.name) as Object;

    const { cssText, defaultVariants, variantToClassMapping } = processCssObject(builtObject, {
      baseClass: this.className,
      readableVariantClass: false,
      ...(this.options as WithStitchesOptions),
    });
    this.defaultVariants = defaultVariants;
    this.variantToClassMapping = variantToClassMapping;

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
    const t = this.astService;
    const objectProperties: ObjectProperty[] = [];
    objectProperties.push(t.objectProperty(t.identifier('class'), t.stringLiteral(this.className)));

    if (this.variantToClassMapping) {
      const a = Object.entries(this.variantToClassMapping).map(([variantType, variants]) => {
        return t.objectProperty(
          t.identifier(variantType),
          t.objectExpression(
            Object.entries(variants).map(([variantName, variantClass]) =>
              t.objectProperty(t.identifier(variantName), t.stringLiteral(variantClass)),
            ),
          ),
        );
      });
      if (a.length) {
        objectProperties.push(t.objectProperty(t.identifier('variants'), t.objectExpression(a)));
      }
    }

    if (this.defaultVariants) {
      const a = Object.entries(this.defaultVariants).map(([variantType, defaultValue]) => {
        return t.objectProperty(t.identifier(variantType), t.stringLiteral(defaultValue));
      });

      if (a.length) {
        objectProperties.push(t.objectProperty(t.identifier('defaults'), t.objectExpression(a)));
      }
    }

    const importedStyles = t.addNamedImport('css', '@mui/no-stitches/runtime');

    this.replacer(t.callExpression(importedStyles, [t.objectExpression(objectProperties)]), true);
  }

  public override get asSelector(): string {
    return `.${this.className}`;
  }

  get value(): Expression {
    const t = this.astService;
    return t.objectExpression([
      t.objectProperty(t.stringLiteral('displayName'), t.stringLiteral(this.displayName)),
      t.objectProperty(
        t.stringLiteral('__linaria'),
        t.objectExpression([
          t.objectProperty(t.stringLiteral('className'), t.stringLiteral(this.className)),
        ]),
      ),
    ]);
  }
}
