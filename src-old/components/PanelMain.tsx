import { useEffect, useState } from "react";
import {
  useMetaframe,
} from "@metapages/metaframe-hook";
import { Badge } from "@chakra-ui/react";
import { MetaframeEvents, MetaframeInputMap } from "@metapages/metapage";

/**
 * Just an example very basic output of incoming inputs
 *
 */
export const PanelMain: React.FC = () => {
  // This is currently the most performant way to get metaframe
  // inputs and cleanup properly
  const metaframeObject = useMetaframe();
  const [inputs, setInputs] = useState<MetaframeInputMap | undefined>();

  // listen to inputs and cleanup up listener
  useEffect(() => {
    if (!metaframeObject?.metaframe) {
      return;
    }
    const metaframe = metaframeObject.metaframe;
    const onInputs = (newinputs: MetaframeInputMap): void => {
      setInputs(newinputs);
    };
    metaframe.addListener(MetaframeEvents.Inputs, onInputs);

    return () => {
      // If the metaframe is cleaned up, also remove the inputs listener
      metaframe.removeListener(MetaframeEvents.Inputs, onInputs);
    };
  }, [metaframeObject.metaframe, setInputs]);

  return (
    <div>
      <Badge>metaframe inputs:</Badge>{" "}
      {inputs
        ? JSON.stringify(inputs)
        : "none yet"}
    </div>
  );
};
