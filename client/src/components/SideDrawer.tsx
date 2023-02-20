import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

const SideDrawer = ({ open, onClose }: Props) => {
  return (
    <Drawer open={open} direction="left" onClose={onClose}>
      <div className="flex h-full flex-col items-center justify-start bg-slate-800 py-8 text-white">
        <h2>Settings</h2>
        <div>Formulär och sånt</div>
      </div>
    </Drawer>
  );
};

export default SideDrawer;
