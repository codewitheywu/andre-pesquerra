// The /behind-the-code page: the life outside the code. Each section only
// appears once it has something in it.

export type Hobby = { name: string; note: string };

export type BehindTheCode = {
  /** One or two sentences that open the page. */
  intro: string;
  /** Where you come from and how you got here, one paragraph per entry. */
  story: string[];
  /** Life today: family, places, what fills the week. */
  life: string[];
  hobbies: Hobby[];
};

// TODO: write these in your own words. Leave a list empty to hide its section.
export const behindTheCode: BehindTheCode = {
  intro: "",
  story: [],
  life: [],
  hobbies: [],
};

/** True once any section has content, so the page can drop its "being written" note. */
export function hasBehindContent(content: BehindTheCode): boolean {
  return (
    content.intro.trim() !== "" ||
    content.story.length > 0 ||
    content.life.length > 0 ||
    content.hobbies.length > 0
  );
}
