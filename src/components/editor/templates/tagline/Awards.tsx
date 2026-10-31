import { Caption } from "../../../ui/typography";
import { BadgeContainer } from "./BadgeContainer";

export const Awards = ({ count }: { count: number }) => (
  <BadgeContainer>
    <Caption>{count} awards</Caption>
  </BadgeContainer>
);
