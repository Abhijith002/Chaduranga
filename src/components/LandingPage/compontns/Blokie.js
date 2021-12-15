import {Skeleton} from "antd";
import Blockies from "react-blockies";
import {useMoralis} from "react-moralis";

function Blockie(props) {
  const {account} = useMoralis();
  if (!props.address && !account) return <Skeleton.Avatar active size={40} />;

  return (
    <Blockies
      seed={
        props.currentWallet
          ? account.toLowerCase()
          : props.address.toLowerCase()
      }
      className="identicon"
      {...props}
    />
  );
}

export default Blockie;
