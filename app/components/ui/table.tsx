export function Table({ children }: any) { return <table className="w-full border-collapse">{children}</table> }
export function THead({ children }: any) { return <thead className="bg-gray-50">{children}</thead> }
export function TBody({ children }: any) { return <tbody>{children}</tbody> }
export function TR({ children }: any) { return <tr className="border-b last:border-0">{children}</tr> }
export function TH({ children }: any) { return <th className="text-left text-sm font-semibold p-3">{children}</th> }
export function TD({ children }: any) { return <td className="text-sm p-3 align-top">{children}</td> }