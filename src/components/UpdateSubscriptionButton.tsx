import React, { useState } from 'react';
import { Button } from '@shopify/polaris';
import { useMutation } from '@apollo/client';
import {
  UPDATE_SUBSCRIPTION_CONTRACT,
  UPDATE_SUBSCRIPTION_DRAFT,
  UPDATE_SUBSCRIPTION_DRAFT_LINE,
  COMMIT_SUBSCRIPTION_DRAFT,
} from '../handlers';

interface Props {
  contractId: string;
  input: any;
  lineId?: string;
  toggleActive: () => void;
  setMsg: (msg: string) => void;
  setToastError: (error: boolean) => void;
  refetch: () => void;
}

function UpdateSubscriptionButton(props: Props) {
  const {
    contractId,
    input,
    lineId,
    toggleActive,
    setMsg,
    setToastError,
    refetch,
  } = props;
  const [loading, setLoading] = useState<boolean>(false);
  // Update subscription contract -> draft id
  const [updateSubscriptionContract] = useMutation(
    UPDATE_SUBSCRIPTION_CONTRACT,
    {
      onCompleted: data => {
        if (lineId) {
          updateDraftLine(
            data.subscriptionContractUpdate.draft.id,
            lineId,
            input
          );
        } else {
          updateDraft(data.subscriptionContractUpdate.draft.id, input);
        }
      },
    }
  );
  // Update subscription draft -> draft id
  const [updateSubscriptionDraft] = useMutation(UPDATE_SUBSCRIPTION_DRAFT, {
    onCompleted: data => commitDraft(data.subscriptionDraftUpdate.draft.id),
  });
  // Update subscription draft line -> draft id
  const [updateSubscriptionDraftLine] = useMutation(
    UPDATE_SUBSCRIPTION_DRAFT_LINE,
    {
      onCompleted: data =>
        commitDraft(data.subscriptionDraftLineUpdate.draft.id),
    }
  );
  // Commit subscription draft -> update toast msg and make it active
  const [commitSubscriptionDraft] = useMutation(COMMIT_SUBSCRIPTION_DRAFT, {
    onCompleted: () => {
      setLoading(false);
      setMsg('Updated Subscription');
      toggleActive();
      refetch();
    },
  });

  const updateDraft = (draftId: string, input: any) => {
    console.log('Updating Draft', draftId);
    try {
      updateSubscriptionDraft({
        variables: {
          draftId: draftId,
          input: input,
        },
      });
    } catch (e) {
      console.log('Update Draft Error', e.message);
      setToastError(true);
      setMsg('Error Updating Subscription');
      toggleActive();
    }
  };

  const updateDraftLine = (draftId: string, lineId: string, input: any) => {
    console.log('Updating Draft Line', lineId);
    try {
      updateSubscriptionDraftLine({
        variables: {
          draftId: draftId,
          lineId: lineId,
          input: input,
        },
      });
    } catch (e) {
      console.log('Update Draft Error', e.message);
    }
  };

  const commitDraft = (draftId: string) => {
    console.log('Committing Draft', draftId);
    try {
      commitSubscriptionDraft({
        variables: {
          draftId: draftId,
        },
      });
    } catch (e) {
      console.log('Commit Draft Error', e.message);
    }
  };

  const handleClick = (lineId?: string) => {
    console.log('Handling Update Click', contractId);
    try {
      setLoading(true);
      updateSubscriptionContract({
        variables: {
          contractId: contractId,
        },
      });
    } catch (e) {
      console.log('Update Contract Error', e.message);
    }
  };

  return (
    <Button primary loading={loading} onClick={() => handleClick(lineId)}>
      Update
    </Button>
  );
}

export default UpdateSubscriptionButton;
