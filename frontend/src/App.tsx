import {useEffect, useState} from 'react';
import Container from './components/UI/Gird/Container';
import { Kanban } from 'react-kanban-kit';
import {Modal} from "./components/UI/Modal";
import {IsSetupComplete} from "../wailsjs/go/main/App"
import {RootUserForm} from "./View/RootUserForm";

function App() {

     const [showSetupModal, setShowSetupModal] = useState(false)

    useEffect(() => {
        const checkSetup = async () => {
            const isSetupComplete = await IsSetupComplete();

            if (!isSetupComplete) {
                setShowSetupModal(true);
            } else {
                setShowSetupModal(false);
            }
        };
        checkSetup();
    }, [setShowSetupModal, IsSetupComplete, showSetupModal]);


  const [dataSource, setDataSource] = useState({
    root: {
      id: "root",
      title: "Root",
      children: ["col-1", "col-2", "col-3"],
      totalChildrenCount: 3,
      parentId: null,
    },
    "col-1": {
      id: "col-1",
      title: "To Do",
      children: ["task-1", "task-2"],
      totalChildrenCount: 2,
      parentId: "root",
    },
    "col-2": {
      id: "col-2",
      title: "In Progress",
      children: ["task-3"],
      totalChildrenCount: 1,
      parentId: "root",
    },
    "col-3": {
      id: "col-3",
      title: "Done",
      children: ["task-4"],
      totalChildrenCount: 1,
      parentId: "root",
    },
    "task-1": {
      id: "task-1",
      title: "Design Homepage",
      parentId: "col-1",
      children: [],
      totalChildrenCount: 0,
      type: "card",
      content: {
        description: "Create wireframes and mockups for the homepage",
        priority: "high",
      },
    },
    "task-2": {
      id: "task-2",
      title: "Setup Database",
      parentId: "col-1",
      children: [],
      totalChildrenCount: 0,
      type: "card",
    },
    "task-3": {
      id: "task-3",
      title: "Develop API",
      parentId: "col-2",
      children: [],
      totalChildrenCount: 0,
      type: "card",
    },
    "task-4": {
      id: "task-4",
      title: "Deploy App",
      parentId: "col-3",
      children: [],
      totalChildrenCount: 0,
      type: "card",
    },
  });


 const configMap = {
    card: {
      render: ({ data, column, index, isDraggable }: any) => (
        <div className="kanban-card">
          <h3>{data.title}</h3>
          {data.content?.description && <p>{data.content.description}</p>}
          <div className="card-meta">
            {data.content?.priority && (
              <span className={`priority ${data.content.priority}`}>
                {data.content.priority}
              </span>
            )}
          </div>
        </div>
      ),
      isDraggable: true,
    },
  };

  return (
    <Container isFluid>
        <Modal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)} >
            <RootUserForm rootSaved={ () => setShowSetupModal(false) } />
        </Modal>
       <Kanban
        dataSource={dataSource}
        configMap={configMap}
        onCardClick={(_, card) => {
         
        }}
        onCardMove={(move) => {
          if (Object.hasOwn(dataSource, move.toColumnId)) {

            const source = {...dataSource}

            const targetColumn = (source as any)[move.toColumnId];
            if (!targetColumn.children.find((id: string) => id === move.cardId)) {
              targetColumn.children.push(move.cardId);
              targetColumn.totalChildrenCount = targetColumn.children.length;
            }

            const sourceColumn = (source as any)[move.fromColumnId];
            sourceColumn.children = sourceColumn.children.filter(
              (id: string) => id !== move.cardId
            );
            sourceColumn.totalChildrenCount = sourceColumn.children.length;
            setDataSource({...source});
          }
        }}
        onColumnMove={(move) => {
          console.log("Column moved:", move);
          // Handle column reordering
        }}
      />
    </Container>
  );
}

export default App;