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
    onCompleted: data => {
      try {
        if (data.subscriptionDraftUpdate.userErrors.length > 0) {
          setLoading(false);
          setToastError(true);
          setMsg(data.subscriptionDraftUpdate.userErrors[0].message);
          toggleActive();
        } else {
          setToastError(false);
          commitDraft(data.subscriptionDraftUpdate.draft.id);
        }
      } catch (e) {
        console.log('Error', e.message);
        setToastError(true);
        setMsg('Error Updating Subscription');
        toggleActive();
      }
    },
  });
  // Update subscription draft line -> draft id
  const [updateSubscriptionDraftLine] = useMutation(
    UPDATE_SUBSCRIPTION_DRAFT_LINE,
    {
      onCompleted: data => {
        try {
          if (data.subscriptionDraftLineUpdate.userErrors.length > 0) {
            setLoading(false);
            setToastError(true);
            setMsg(data.subscriptionDraftLineUpdate.userErrors[0].message);
            toggleActive();
          } else {
            setToastError(false);
            commitDraft(data.subscriptionDraftLineUpdate.draft.id);
          }
        } catch (e) {
          console.log('Error', e.message);
          setToastError(true);
          setMsg('Error Updating Subscription');
          toggleActive();
        }
      },
    }
  );
  // Commit subscription draft -> update toast msg and make it active
  const [commitSubscriptionDraft] = useMutation(COMMIT_SUBSCRIPTION_DRAFT, {
    onCompleted: () => {
      try {
        setLoading(false);
        setMsg('Updated Subscription');
        toggleActive();
        refetch();
      } catch (e) {
        console.log('Error', e.message);
        setToastError(true);
        setMsg('Error Refetching Subscription');
        toggleActive();
      }
    },
  });

  const updateDraft = (draftId: string, input: any) => {
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
