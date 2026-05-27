"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Cog, ChevronDown, ChevronUp, Code2, Copy, Check } from "lucide-react"
import { useLang } from "@/lib/i18n"

const techCodes = [
  `extends Control
class_name Inventory

signal item_added(item: InventoryItem)
signal item_removed(item: InventoryItem)

@export var slots_count: int = 20
@export var slot_scene: PackedScene

var slots: Array[InventorySlot] = []

func _ready() -> void:
    _initialize_slots()

func _initialize_slots() -> void:
    for i in range(slots_count):
        var slot = slot_scene.instantiate() as InventorySlot
        slot.slot_index = i
        slot.item_dropped.connect(_on_item_dropped)
        $GridContainer.add_child(slot)
        slots.append(slot)

func add_item(item: InventoryItem) -> bool:
    if item.stackable:
        for slot in slots:
            if slot.can_stack(item):
                slot.add_to_stack(item.quantity)
                item_added.emit(item)
                return true
    for slot in slots:
        if slot.is_empty():
            slot.set_item(item)
            item_added.emit(item)
            return true
    return false

func _on_item_dropped(from: int, to: int) -> void:
    var temp = slots[from].current_item
    slots[from].set_item(slots[to].current_item)
    slots[to].set_item(temp)`,
  `using UnityEngine;
using System.Collections.Generic;

public abstract class State
{
    protected StateMachine stateMachine;
    public State(StateMachine sm) => stateMachine = sm;
    public virtual void Enter() { }
    public virtual void Update() { }
    public virtual void FixedUpdate() { }
    public virtual void Exit() { }
}

public class StateMachine : MonoBehaviour
{
    private State currentState;
    private Dictionary<System.Type, State> states = new();
    
    public void AddState(State state) { states[state.GetType()] = state; }
    
    public void SetState<T>() where T : State
    {
        var type = typeof(T);
        if (!states.ContainsKey(type)) { Debug.LogError($"State {type} not found!"); return; }
        currentState?.Exit();
        currentState = states[type];
        currentState.Enter();
    }
    
    private void Update() { currentState?.Update(); }
    private void FixedUpdate() { currentState?.FixedUpdate(); }
}`,
  `extends Node
class_name DialogueManager

signal dialogue_started
signal dialogue_ended
signal line_displayed(speaker: String, text: String)
signal choices_displayed(choices: Array[DialogueChoice])

var current_dialogue: DialogueTree
var current_node_id: String
var variables: Dictionary = {}

func start_dialogue(dialogue: DialogueTree) -> void:
    current_dialogue = dialogue
    current_node_id = dialogue.start_node
    dialogue_started.emit()
    _process_current_node()

func _process_current_node() -> void:
    var node = current_dialogue.get_node(current_node_id)
    match node.type:
        "line": line_displayed.emit(node.speaker, _process_variables(node.text))
        "choice": choices_displayed.emit(_filter_choices(node.choices))
        "condition": current_node_id = _evaluate_condition(node); _process_current_node()
        "end": dialogue_ended.emit()

func select_choice(choice_index: int) -> void:
    var choice = current_dialogue.get_node(current_node_id).choices[choice_index]
    for effect in choice.effects: _apply_effect(effect)
    current_node_id = choice.next_node
    _process_current_node()`,
]

const techTags = [
  ["GDScript", "Godot", "UI"],
  ["C#", "Unity", "AI"],
  ["GDScript", "Godot", "Narrativa"],
]

const techLanguages = ["gdscript", "csharp", "gdscript"]

export function TechLab() {
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const { t } = useLang()
  const tl = t.techlab

  const techProjects = tl.projects.map((project, index) => ({
    id: index,
    title: project.title,
    description: project.description,
    tags: project.tags,
    language: techLanguages[index],
    code: techCodes[index],
    explanation: project.explanation,
  }))

  const copyCode = async (code: string, id: number) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 border border-accent/30">
            <Cog className="h-5 w-5 text-accent" />
          </div>
          <h2 className="font-serif text-3xl font-bold">
            Tech Lab
          </h2>
        </div>
        <p className="text-muted-foreground mb-12 max-w-2xl">
          {tl.subtitle}
        </p>

        {/* Projects Grid */}
        <div className="space-y-6">
          {techProjects.map((project) => (
            <Card 
              key={project.id}
              className="overflow-hidden border-border/50 bg-card"
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* GIF Preview */}
                  <div className="relative w-full md:w-48 aspect-video md:aspect-square rounded-lg overflow-hidden bg-muted shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Code2 className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    {/* Placeholder for GIF */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                  </div>

                  <div className="flex-1">
                    <CardTitle className="font-serif text-xl mb-2">
                      {project.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mb-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <Badge 
                          key={tag}
                          variant="secondary"
                          className="text-xs font-mono bg-accent/10 text-accent border-accent/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                      className="gap-2 border-border/50 hover:border-primary/50"
                    >
                      <Code2 className="h-4 w-4" />
                      {expandedProject === project.id ? tl.hideCode : tl.showCode}
                      {expandedProject === project.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Expanded Code Section */}
              {expandedProject === project.id && (
                <CardContent className="pt-0 border-t border-border/50">
                  <div className="mt-4 space-y-4">
                    {/* Code Block */}
                    <div className="relative rounded-lg bg-[#1a1b26] border border-border/30 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-background/50">
                        <span className="font-mono text-xs text-muted-foreground">
                          {project.language === "gdscript" ? "GDScript" : "C#"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(project.code, project.id)}
                          className="h-7 gap-1 text-xs"
                        >
                          {copiedId === project.id ? (
                            <>
                              <Check className="h-3 w-3 text-primary" />
                              {tl.copied}
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              {tl.copy}
                            </>
                          )}
                        </Button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-sm">
                        <code className="font-mono text-foreground/90">
                          {project.code}
                        </code>
                      </pre>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-3">
                      <h4 className="font-serif font-semibold text-primary">
                        {tl.stepByStep}
                      </h4>
                      <ol className="space-y-2">
                        {project.explanation.map((step, index) => (
                          <li key={index} className="flex gap-3 text-sm text-muted-foreground">
                            <span className="font-mono text-xs text-accent shrink-0 mt-0.5">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
