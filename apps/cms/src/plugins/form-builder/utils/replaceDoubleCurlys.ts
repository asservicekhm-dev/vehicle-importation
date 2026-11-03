type EmailVariable = {
  field: string;
  value?: null | string;
};

type EmailVariables = EmailVariable[];

export const replaceDoubleCurlys = (str: string, variables?: EmailVariables): string => {
  const regex = /\{\{(.+?)\}\}/g;

  if (str && variables) {
    return str.replace(regex, (_, variable: string) => {
      const foundVariable = variables.find(({ field: fieldName }) => variable === fieldName);
      if (foundVariable?.value != null) return foundVariable.value;
      return variable;
    });
  }

  return str;
};
