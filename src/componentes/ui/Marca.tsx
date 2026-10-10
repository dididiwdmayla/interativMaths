/** A marca: "interativ" a tinta, "Maths" sobre marca-texto. */
export function Marca({ tamanho = 18 }: { tamanho?: number }) {
  return (
    <span className="whitespace-nowrap font-extrabold leading-none" style={{ fontSize: tamanho, letterSpacing: "-0.3px" }}>
      interativ<span className="rounded-[4px] bg-marca-texto px-1">Maths</span>
    </span>
  );
}
