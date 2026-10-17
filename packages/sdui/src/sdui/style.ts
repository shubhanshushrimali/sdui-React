import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { z } from 'zod';
import type { SDUIStyle } from './types';

const finite = z.number().finite();
const dimension = z.union([finite, z.string().regex(/^(auto|\d+(\.\d+)?%)$/)]);
const color = z.string().regex(/^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|[a-zA-Z]{1,32})$/);

export const SDUIStyleSchema = z
  .object({
    flex: finite.optional(),
    flexDirection: z.enum(['row', 'column', 'row-reverse', 'column-reverse']).optional(),
    justifyContent: z
      .enum(['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'])
      .optional(),
    alignItems: z.enum(['flex-start', 'flex-end', 'center', 'stretch', 'baseline']).optional(),
    alignSelf: z.enum(['flex-start', 'flex-end', 'center', 'stretch', 'baseline']).optional(),
    flexWrap: z.enum(['wrap', 'nowrap']).optional(),
    gap: finite.optional(),
    padding: finite.optional(),
    paddingHorizontal: finite.optional(),
    paddingVertical: finite.optional(),
    paddingTop: finite.optional(),
    paddingBottom: finite.optional(),
    paddingLeft: finite.optional(),
    paddingRight: finite.optional(),
    margin: finite.optional(),
    marginHorizontal: finite.optional(),
    marginVertical: finite.optional(),
    marginTop: finite.optional(),
    marginBottom: finite.optional(),
    marginLeft: finite.optional(),
    marginRight: finite.optional(),
    width: dimension.optional(),
    height: dimension.optional(),
    minWidth: dimension.optional(),
    minHeight: dimension.optional(),
    maxWidth: dimension.optional(),
    maxHeight: dimension.optional(),
    backgroundColor: color.optional(),
    opacity: finite.min(0).max(1).optional(),
    borderWidth: finite.optional(),
    borderColor: color.optional(),
    borderRadius: finite.optional(),
    borderTopLeftRadius: finite.optional(),
    borderTopRightRadius: finite.optional(),
    borderBottomLeftRadius: finite.optional(),
    borderBottomRightRadius: finite.optional(),
    shadowColor: color.optional(),
    shadowOffset: z.object({ width: finite, height: finite }).strict().optional(),
    shadowOpacity: finite.min(0).max(1).optional(),
    shadowRadius: finite.optional(),
    elevation: finite.optional(),
    fontSize: finite.optional(),
    fontWeight: z
      .enum(['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'])
      .optional(),
    color: color.optional(),
    textAlign: z.enum(['auto', 'left', 'right', 'center', 'justify']).optional(),
    lineHeight: finite.optional(),
    letterSpacing: finite.optional(),
    textTransform: z.enum(['none', 'capitalize', 'uppercase', 'lowercase']).optional(),
    textDecorationLine: z.enum(['none', 'underline', 'line-through']).optional(),
    position: z.enum(['relative', 'absolute']).optional(),
    top: finite.optional(),
    right: finite.optional(),
    bottom: finite.optional(),
    left: finite.optional(),
    zIndex: finite.optional(),
    overflow: z.enum(['visible', 'hidden', 'scroll']).optional(),
  })
  .strict();

/** Keeps only a style object that matches the schema. Anything else is dropped. */
export function schemaStyle(style: SDUIStyle | unknown): ViewStyle & TextStyle {
  const parsed = SDUIStyleSchema.safeParse(style ?? {});
  if (!parsed.success) return {};
  return parsed.data as ViewStyle & TextStyle;
}

/** Image styles share the schema, except `overflow: "scroll"` which Image does not accept. */
export function imageStyle(style: SDUIStyle | unknown): ImageStyle {
  const parsed = schemaStyle(style);
  if (parsed.overflow === 'scroll') {
    const { overflow: _overflow, ...rest } = parsed;
    return rest as ImageStyle;
  }
  return parsed as ImageStyle;
}
