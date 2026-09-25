import { Engraving, type EngravingProps } from 'copperplate/react';

/**
 * Any image as an engraved plate: its brightness becomes the depth of the
 * cut. The library's Engraving, with the kit's defaults.
 */
export function Plate({ plateMark = true, material = 'copper', ...props }: EngravingProps) {
  return <Engraving plateMark={plateMark} material={material} {...props} />;
}
