import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import React, { useState, useEffect, useMemo } from 'react';
import { FaSave, FaSpinner } from 'react-icons/fa';

import { GuidedDraggingTool } from '../GuidedDraggingTool';
import dataset from '../data.json';


import './Diagram.css';
import { useRef } from 'react';

const DiagramWrapper: React.FC = () => {
  const savedDiagram = localStorage.getItem('diagram');
  const savedModel =  savedDiagram ? go.Model.fromJson(savedDiagram) : undefined;

  const diagramRef = useRef<ReactDiagram>(null);
  const diagramStyle = { backgroundColor: '#eee' };
  const [isSaving, setIsSaving] = useState(false);

  const initDiagram = (): go.Diagram => {
    const $ = go.GraphObject.make;

    const nodeMenu = go.GraphObject.build("ContextMenu")
      .add(
        go.GraphObject.build("ContextMenuButton", {
            click: (e, obj) => {
              const diagram = obj.diagram;
              if (diagram) {
                diagram.commit(d => {
                  const node = obj.part;
                  if (node) {
                    const data = node.data;
                    const currentFont = data.font;
                    const [, fontSize] = currentFont.match(/(\d+)px/);
                    const newSize = fontSize * 2;
                    const newFont = currentFont.replace(/(\d+)px/, `${newSize}px`);
                    d.model.setDataProperty(data, "font", newFont);
                  }
                });
              }
            },
            "ButtonBorder.fill": "white",
            "_buttonFillOver": "skyblue",
          })
          .add(new go.TextBlock("Zoom-in")),
      );
      
      const linkMenu = go.GraphObject.build("ContextMenu")
      .add(
        go.GraphObject.build("ContextMenuButton", {
            click: (e, obj) => {
              const diagram = obj.diagram;
              if (diagram) {
                diagram.commit(d => {
                  const node = obj.part;
                  if (node) {
                    const data = node.data;
                    const currentFont = data.font;
                    const [, fontSize] = currentFont.match(/(\d+)px/);
                    const newSize = fontSize/2;
                    const newFont = currentFont.replace(/(\d+)px/, `${newSize}px`);
                    d.model.setDataProperty(data, "font", newFont);
                  }
                });
              }
            },
            "ButtonBorder.fill": "white",
            "_buttonFillOver": "skyblue",
          })
          .add(new go.TextBlock("Zoom-out")),
      );

    const diagram = $(
      go.Diagram,
      {
        'undoManager.isEnabled': true,
        'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
        draggingTool: new GuidedDraggingTool(),
        'draggingTool.horizontalGuidelineColor': 'blue',
        'draggingTool.verticalGuidelineColor': 'blue',
        'draggingTool.centerGuidelineColor': 'green',
        'draggingTool.guidelineWidth': 1,
        layout: $(go.TreeLayout),
        model: $(
          go.GraphLinksModel,
          {
            linkKeyProperty: 'key',
            makeUniqueKeyFunction: (m: go.Model, data: any) => {
              let k = data.key || 1;
              while (m.findNodeDataForKey(k)) k++;
              data.key = k;
              return k;
            },
            makeUniqueLinkKeyFunction: (m: go.GraphLinksModel, data: any) => {
              let k = data.key || -1;
              while (m.findLinkDataForKey(k)) k--;
              data.key = k;
              return k;
            },
          }
        )
      }
    );

    diagram.nodeTemplate = $(
      go.Node, 'Auto', { resizable: true },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
      $(go.Shape, 'Circle', {
        name: 'SHAPE', fill: 'white', strokeWidth: 0,
        portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
      },
        new go.Binding('fill', 'color')
      ),
      $(go.TextBlock, {
        margin: 8, editable: true, name: "NODE_TEXT",
      },
        new go.Binding("text", "key").makeTwoWay(),
        new go.Binding("font", "font").makeTwoWay()

      ),
      { contextMenu: nodeMenu }
    );

    diagram.linkTemplate = $(
      go.Link,
      new go.Binding('relinkableFrom', 'canRelink').ofModel(),
      new go.Binding('relinkableTo', 'canRelink').ofModel(),
      $(go.Shape),
      $(go.Shape, { toArrow: 'Standard' }),
      $(go.TextBlock, {
        margin: 8, editable: true, name: "NODE_TEXT",
      },
        new go.Binding("text").makeTwoWay(),
        new go.Binding("font", "font").makeTwoWay()

      ),
      {contextMenu: linkMenu}
    );

   if (savedModel) diagram.model = savedModel;

    diagram.addModelChangedListener((e) => {
      if (e.isTransactionFinished) {
        console.log("saving")
        setIsSaving(true);
       localStorage.setItem('diagram', diagram.model.toJson());
        setTimeout(() => {
          console.log("saved")
          setIsSaving(false);
        }, 2000);
      }
    });

    return diagram;
  };

  const diagram = useMemo(() => initDiagram(), []);
  const nodes = diagram.model.nodeDataArray.length ? diagram.model.nodeDataArray : dataset.nodes;
  const links = diagram.model.linkDataArray.length ? diagram.model.linkDataArray : dataset.links;

  return (
    <>
      <select onChange={(e) => {
        const diagram = diagramRef.current?.getDiagram();
        const selectedNode = diagram?.findNodeForKey(Number(e.target.value)) || diagram?.findNodeForKey((e.target.value));
        if (selectedNode) {
          diagram?.select(selectedNode);
          diagram?.scrollToRect(selectedNode.actualBounds);
        }
      }}>
        {nodes.map((node, index) => (
          <option key={index} value={node.key}>
            {node.key}
          </option>
        ))}
      </select> 
      <div className="save-status">
        {isSaving ? 
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
 <FaSpinner className="loading-icon" /> <span>saving</span> </div>: 
        
       
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
        <FaSave className="saved-icon" />
        <span>saved</span>
        </div>
        }
      </div>
      <ReactDiagram
        ref={diagramRef}
        divClassName='diagram-component'
        style={diagramStyle}
        initDiagram={() => diagram}
        nodeDataArray={nodes}
        linkDataArray={links}
      />
    </>
  );
};

export default DiagramWrapper;
