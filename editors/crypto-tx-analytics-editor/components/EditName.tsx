import { setName } from "document-model";
import type { FormEventHandler, MouseEventHandler } from "react";
import { useState } from "react";
import { useSelectedGnosispayAnalyticsDocument } from "gnosis-tx-analytics/document-models/gnosispay-analytics";

/** Displays the name of the selected GnosispayAnalytics document and allows editing it */
export function EditGnosispayAnalyticsName() {
  const [gnosispayAnalyticsDocument, dispatch] =
    useSelectedGnosispayAnalyticsDocument();
  const [isEditing, setIsEditing] = useState(false);

  if (!gnosispayAnalyticsDocument) return null;

  const documentName = gnosispayAnalyticsDocument.header.name;

  const onClickEditName: MouseEventHandler<HTMLButtonElement> = () => {
    setIsEditing(true);
  };

  const onClickCancelEditName: MouseEventHandler<HTMLButtonElement> = () => {
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
          defaultValue={documentName}
          autoFocus
        />
        <div className="flex gap-2">
          <button type="submit" className="text-sm text-gray-600">
            Save
          </button>
          <button
            className="text-sm text-red-800"
            onClick={onClickCancelEditName}
          >
            Cancel
          </button>
        </div>
      </form>
    );

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-900">{documentName}</h2>
      <button className="text-sm text-gray-600" onClick={onClickEditName}>
        Edit Name
      </button>
    </div>
  );
}
