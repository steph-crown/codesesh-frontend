export type UserColor = {
  name: string;
  bg: string;
  text: string;
  border: string;
  cursor: string;
};

const PALETTE: UserColor[] = [
  {
    name: "red",
    bg: "#FEE2E2",
    text: "#991B1B",
    border: "#FECACA",
    cursor: "#EF4444",
  },
  {
    name: "blue",
    bg: "#DBEAFE",
    text: "#1E3A8A",
    border: "#BFDBFE",
    cursor: "#3B82F6",
  },
  {
    name: "green",
    bg: "#DCFCE7",
    text: "#14532D",
    border: "#BBF7D0",
    cursor: "#22C55E",
  },
  {
    name: "purple",
    bg: "#F3E8FF",
    text: "#581C87",
    border: "#E9D5FF",
    cursor: "#A855F7",
  },
  {
    name: "pink",
    bg: "#FCE7F3",
    text: "#831843",
    border: "#FBCFE8",
    cursor: "#EC4899",
  },
  {
    name: "teal",
    bg: "#CCFBF1",
    text: "#134E4A",
    border: "#99F6E4",
    cursor: "#14B8A6",
  },
  {
    name: "orange",
    bg: "#FFEDD5",
    text: "#7C2D12",
    border: "#FED7AA",
    cursor: "#F97316",
  },
  {
    name: "indigo",
    bg: "#E0E7FF",
    text: "#312E81",
    border: "#C7D2FE",
    cursor: "#6366F1",
  },
  {
    name: "cyan",
    bg: "#CFFAFE",
    text: "#164E63",
    border: "#A5F3FC",
    cursor: "#06B6D4",
  },
  {
    name: "amber",
    bg: "#FEF3C7",
    text: "#78350F",
    border: "#FDE68A",
    cursor: "#F59E0B",
  },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getColorForUser(username: string): UserColor {
  const index = hashString(username) % PALETTE.length;
  return PALETTE[index];
}

export function getColorByName(name: string): UserColor | undefined {
  return PALETTE.find((c) => c.name === name);
}

export { PALETTE };
