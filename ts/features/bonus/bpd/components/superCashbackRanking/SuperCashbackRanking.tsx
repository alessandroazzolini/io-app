import * as React from "react";
import { connect } from "react-redux";
import { View } from "native-base";
import { GlobalState } from "../../../../../store/reducers/types";
import { bpdSelectedPeriodSelector } from "../../store/reducers/details/selectedPeriod";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import { H3 } from "../../../../../components/core/typography/H3";
import I18n from "../../../../../i18n";
import Markdown from "../../../../../components/ui/Markdown";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import {
  BpdPeriodWithInfo,
  isBpdRankingReady
} from "../../store/reducers/details/periods";
import { localeDateFormat } from "../../../../../utils/locale";
import { useIOBottomSheet } from "../../../../../utils/bottomSheet";
import { formatNumberWithNoDigits } from "../../../../../utils/stringBuilder";
import { H4 } from "../../../../../components/core/typography/H4";
import { isInGracePeriod } from "../../utils/dates";
import { FirstPositionItem } from "./FirstPositionItem";
import { LastPositionItem } from "./LastPositionItem";
import UserPositionItem from "./UserPositionItem";
import SuperCashbackHeader from "./SuperCashbackHeader";

type Props = ReturnType<typeof mapStateToProps>;

const RankingItems: React.FunctionComponent<Props> = (props: Props) => {
  if (props.selectedPeriod && isBpdRankingReady(props.selectedPeriod.ranking)) {
    const mapRankingItems: Map<number, React.ReactNode> = new Map<
      number,
      React.ReactNode
    >([
      [
        1,
        <FirstPositionItem
          key={"item-1"}
          superCashbackAmount={props.selectedPeriod.superCashbackAmount}
          transactionsNumber={props.selectedPeriod.ranking.maxTransactionNumber}
        />
      ],
      [
        props.selectedPeriod.minPosition,
        <LastPositionItem
          key={`item-${props.selectedPeriod.minPosition}`}
          superCashbackAmount={props.selectedPeriod.superCashbackAmount}
          transactionsNumber={props.selectedPeriod.ranking.minTransactionNumber}
          lastAvailablePosition={props.selectedPeriod.minPosition}
        />
      ],
      [
        props.selectedPeriod.ranking.ranking,
        <UserPositionItem
          key={`item-${props.selectedPeriod.ranking.ranking}`}
          superCashbackAmount={props.selectedPeriod.superCashbackAmount}
          transactionsNumber={props.selectedPeriod.ranking.transactionNumber}
          hideBadge={
            props.selectedPeriod.ranking.ranking >
            props.selectedPeriod.minPosition
          }
          userPosition={props.selectedPeriod.ranking.ranking}
        />
      ]
    ]);

    const key = [...mapRankingItems.keys()].sort((a, b) => a - b);

    return <>{key.map(k => mapRankingItems.get(k))}</>;
  }

  return null;
};

const CSS_STYLE = `
body {
  color: ${IOColors.bluegreyDark}
}
`;

const calculateEndDate = (selectedPeriod: BpdPeriodWithInfo): string => {
  const endDate = new Date(selectedPeriod.endDate.getTime());
  endDate.setDate(endDate.getDate() + selectedPeriod.gracePeriod);

  return localeDateFormat(endDate, I18n.t("global.dateFormats.shortFormat"));
};

const SuperCashbackBottomSheet: React.FunctionComponent<Props> = (
  props: Props
) => (
  <>
    <View spacer={true} />
    <RankingItems {...props} />
    <View spacer={true} small />
    <ItemSeparatorComponent noPadded={true} />
    <View spacer={true} />
    <H3>{I18n.t("bonus.bpd.details.superCashback.howItWorks.title")}</H3>
    <View spacer={true} />
    {props.selectedPeriod && (
      <>
        <Markdown cssStyle={CSS_STYLE}>
          {I18n.t("bonus.bpd.details.superCashback.howItWorks.body", {
            citizens: props.selectedPeriod.minPosition,
            amount: formatNumberWithNoDigits(
              props.selectedPeriod.superCashbackAmount
            )
          })}
        </Markdown>
        <View spacer />
        {props.selectedPeriod.status === "Active" ||
        isInGracePeriod(
          props.selectedPeriod.endDate,
          props.selectedPeriod.gracePeriod
        ) ? (
          <Markdown cssStyle={CSS_STYLE}>
            {I18n.t(
              "bonus.bpd.details.superCashback.howItWorks.status.active",
              {
                endDate: calculateEndDate(props.selectedPeriod)
              }
            )}
          </Markdown>
        ) : (
          <H4 weight={"Bold"}>
            {I18n.t("bonus.bpd.details.superCashback.howItWorks.status.closed")}
          </H4>
        )}
      </>
    )}
  </>
);

const mapStateToProps = (state: GlobalState) => ({
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

const SuperCashbackRanking = connect(mapStateToProps)(SuperCashbackBottomSheet);

export default SuperCashbackRanking;

export const useSuperCashbackRankingBottomSheet = () =>
  useIOBottomSheet(<SuperCashbackRanking />, <SuperCashbackHeader />, 520);
