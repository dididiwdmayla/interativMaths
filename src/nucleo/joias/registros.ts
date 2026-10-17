/** As joias treináveis e o registro de cada uma. Joia nova entra com uma linha aqui. */
import { REGISTRO_ABACO } from "./abaco";
import type { RegistroJoia } from "./registro";

export const REGISTROS: Readonly<Record<string, RegistroJoia>> = {
  abaco: REGISTRO_ABACO,
};
