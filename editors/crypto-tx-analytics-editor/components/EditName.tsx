import { setName } from "document-model";
import type { FormEventHandler, MouseEventHandler } from "react";
import { useState } from "react";
import { useSelectedCryptoTransactionAnalyticsDocument } from "gnosis-tx-analytics/document-models/crypto-transaction-analytics";

/** Displays the name of the selected CryptoTransactionAnalytics document and allows editing it */
export function EditCryptoTransactionAnalyticsName() {
  const [cryptoTransactionAnalyticsDocument, dispatch] =
    useSelectedCryptoTransactionAnalyticsDocument();
  const [isEditing, setIsEditing] = useState(false);

  if (!cryptoTransactionAnalyticsDocument) return null;

  const cryptoTransactionAnalyticsDocumentName =
    cryptoTransactionAnalyticsDocument.header.name;

  const onClickEditCryptoTransactionAnalyticsName: MouseEventHandler<
    HTMLButtonElement
  > = () => {
    setIsEditing(true);
  };

  const onClickCancelEditCryptoTransactionAnalyticsName: MouseEventHandler<
    HTMLButtonElement
  > = () => {
    setIsEditing(false);
  };

  const onSubmitSetName: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
    const name = nameInput.value;
    if (!name) return;

    dispatch(setName(name));
    setIsEditing(false);
  };

  if (isEditing)
    return (
      <form
        className="flex gap-2 items-center justify-between"
        onSubmit={onSubmitSetName}
      >
        <input
          className="text-lg font-semibold text-gray-900 p-1"
          type="text"
          name="name"
          defaultValue={cryptoTransactionAnalyticsDocumentName}
          autoFocus
        />
        <div className="flex gap-2">
          <button type="submit" className="text-sm text-gray-600">
            Save
          </button>
          <button
            className="text-sm text-red-800"
            onClick={onClickCancelEditCryptoTransactionAnalyticsName}
          >
            Cancel
          </button>
        </div>
      </form>
    );

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-900">
        {cryptoTransactionAnalyticsDocumentName}
      </h2>
      <button
        className="text-sm text-gray-600"
        onClick={onClickEditCryptoTransactionAnalyticsName}
      >
        Edit Name
      </button>
    </div>
  );
}
