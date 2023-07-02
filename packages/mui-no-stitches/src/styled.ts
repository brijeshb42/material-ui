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
  WrappedNode,
} from '@linaria/tags';
import { WithStitchesOptions, processCssObject } from './common';

export default class StyledProcessor extends BaseProcessor {
  public component: WrappedNode;

  params: CallParam;

  defaultVariants?: { [key: string]: string };

  variantToClassMapping: { [key: string]: { [key: string]: string } } = {};

  constructor(params: Params, ...args: TailProcessorParams) {
    super(params, ...args);

    if (this.tagSource.source !== '@stitches/react') {
      throw BaseProcessor.SKIP;
    }
    validateParams(params, ['callee', 'call'], `Invalid use of ${this.tagSource.imported} tag.`);
    const [, callParams] = params;

    if (callParams.length !== 3) {
      throw new Error(`Invalid use of ${this.tagSource.imported} tag. It should have 2 arguments.`);
    }

    if (callParams[2].source.includes('propsAsIs')) {
      throw BaseProcessor.SKIP;
    }

    this.params = callParams;

    let component: WrappedNode | undefined;
    const [, componentParam] = callParams;

    if (componentParam.kind === ValueType.LAZY || componentParam.kind === ValueType.FUNCTION) {
      component = {
        node: componentParam.ex,
        source: componentParam.source,
      };
    } else if (componentParam.ex.type === 'StringLiteral') {
      component = componentParam.ex.value;
    }

    if (!component) {
      throw new Error(`Invalid use \`${this.tagSource.imported}\` tag`);
    }
    this.component = component;
  }

  build(values: ValueCache): void {
    // @ts-ignore
    const [, , cssObject] = this.params;
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
    objectProperties.push(
      t.objectProperty(t.identifier('name'), t.stringLiteral(this.displayName)),
    );
    objectProperties.push(t.objectProperty(t.identifier('class'), t.stringLiteral(this.className)));
    objectProperties.push(t.objectProperty(t.identifier('propsAsIs'), t.booleanLiteral(true)));

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

    const importedStyles = t.addNamedImport('styled', './runtime');

    const firstArg =
      typeof this.component === 'string'
        ? t.stringLiteral(this.component)
        : t.callExpression(this.component.node, []);

    this.replacer(
      t.callExpression(importedStyles, [firstArg, t.objectExpression(objectProperties)]),
      true,
    );
  }

  public override get asSelector(): string {
    return `.${this.className}`;
  }

  get value(): Expression {
    const t = this.astService;
    const extendsNode = typeof this.component === 'string' ? null : this.component.node.name;

    return t.objectExpression([
      t.objectProperty(t.stringLiteral('displayName'), t.stringLiteral(this.displayName)),
      t.objectProperty(
        t.stringLiteral('__linaria'),
        t.objectExpression([
          t.objectProperty(t.stringLiteral('className'), t.stringLiteral(this.className)),
          t.objectProperty(
            t.stringLiteral('extends'),
            extendsNode ? t.callExpression(t.identifier(extendsNode), []) : t.nullLiteral(),
          ),
        ]),
      ),
    ]);
  }
}
