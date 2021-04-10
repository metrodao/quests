import { Button, useToast } from '@1hive/1hive-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { GiTwoCoins } from 'react-icons/gi';
import { useWallet } from 'use-wallet';
import QuestProvider from '../../providers/QuestProvider';
import { emptyFunc } from '../../utils/class-util';
import AmountFieldInput from '../Shared/FieldInput/AmountFieldInput';
import ModalBase from './ModalBase';

export default function FundModal({ questAddress, onClose = emptyFunc }) {
  const { account } = useWallet();
  const [fundAmount, setFundAmount] = useState(undefined);
  const [opened, setOpened] = useState(false);
  const toast = useToast();
  const onModalClose = () => {
    setOpened(false);
    onClose();
  };
  const onFundClick = () => {
    onModalClose();
    QuestProvider.fundQuest(account.address, questAddress, fundAmount);
    toast('Successfully funded');
  };

  return (
    <ModalBase
      title="Fund"
      openButton={
        <Button icon={<GiTwoCoins />} onClick={() => setOpened(true)} label="Fund" mode="strong" />
      }
      buttons={<Button icon={<GiTwoCoins />} onClick={onFundClick} label="Fund" mode="strong" />}
      onClose={onModalClose}
      isOpen={opened}
    >
      <AmountFieldInput
        id="fundAmount"
        isEdit
        label="Amount"
        value={fundAmount}
        onChange={setFundAmount}
      />
    </ModalBase>
  );
}

FundModal.propTypes = {
  onClose: PropTypes.func,
  questAddress: PropTypes.string.isRequired,
};
