export interface TechItem {
  name: string;
  description: string;
}

export interface TechSection {
  title: string;
  items: TechItem[];
}
