export default function readable() {
  return tree => {
    const visit = parent => {
      for (let index=0; index<(parent.children||[]).length; index++) {
        const node=parent.children[index];
        if(node.type==='element' && node.tagName==='pre')node.properties={...node.properties,tabIndex:0,role:'region','aria-label':'코드 예제'};
        if(node.type==='element' && node.tagName==='table') {
          parent.children[index]={type:'element',tagName:'div',properties:{className:['table-scroll'],tabIndex:0,role:'region','aria-label':'본문 표'},children:[node]};
          visit(node);
        } else visit(node);
      }
    };
    visit(tree);
  };
}
