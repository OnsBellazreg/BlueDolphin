const Dropdown = ({ nodes: [] }) => {
    return (
      <select>
        {nodes.map((node, index) => (
          <option key={index} value={node.key}>
            {node.key}
          </option>
        ))}
      </select>
    );
  };