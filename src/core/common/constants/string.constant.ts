declare global {
  interface String {
    capitalize(): string;
    capitalizeAll(): string;
  }
}

String.prototype.capitalize = function () {
  return this.toLowerCase().replace(/(^[a-z])/, (c: string) => c.toUpperCase());
};
String.prototype.capitalizeAll = function () {
  return this.toLowerCase().replace(/\b(^[a-z])/g, (c: string) =>
    c.toUpperCase(),
  );
};

export {};
