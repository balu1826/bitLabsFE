import "./Overlay.css";


const Overlay = ({ children, onClose }) => {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)", 
        backdropFilter: "blur(6px)",            
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Overlay;


// export default Overlay;
